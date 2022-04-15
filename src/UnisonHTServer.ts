import express, { Express } from "express";
import Debug from "debug";
import swaggerUi from "swagger-ui-express";
import { createRouter } from "./routes";
import { IUnisonHTPlugin, PluginOptions } from "./types/IUnisonHTPlugin";
import path from "path";
import { UnisonHTConfig } from "./types/UnisonHTConfig";
import { NodeOptions, UnisonHTNode } from "./types/UnisonHTNode";
import { StatusCodes } from "http-status-codes";
import {
  getStatusCodeFromError,
  setStatusCodeOnError,
} from "./types/ErrorWithStatusCode";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";

export class UnisonHTServer {
  private readonly debug = Debug("unisonht:server");
  private readonly app: Express;
  private readonly plugins: IUnisonHTPlugin[] = [];
  private readonly _nodes: UnisonHTNode[] = [];
  private _config: UnisonHTConfig;
  private _mode: string;

  constructor(config?: UnisonHTConfig) {
    const swaggerJson = require(path.join(
      __dirname,
      "..",
      "dist",
      "swagger.json"
    ));
    this._config = {
      defaultMode: "OFF",
      modes: ["OFF"],
      nodes: [],
      edges: [],
      ...config,
    };
    this._mode = this.config.defaultMode;

    this.app = express();
    this.app.use(express.json());
    this.app.get("/swagger.json", (req, resp) => {
      const newSwaggerJson = JSON.parse(JSON.stringify(swaggerJson));

      for (const plugin of this.plugins) {
        const pluginOptions: PluginOptions = {
          server: this,
          app: this.app,
          config: this.config,
        };
        plugin.updateSwaggerJson?.(newSwaggerJson, pluginOptions);
      }

      for (const node of this.nodes) {
        const nodeOptions: NodeOptions = {
          server: this,
          app: this.app,
          config: this.config,
        };
        node.updateSwaggerJson?.(newSwaggerJson, nodeOptions);
      }

      resp.json(newSwaggerJson);
    });
    this.app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: "/swagger.json",
        },
      })
    );
    this.app.use(createRouter(this));
  }

  async start(options?: { port?: number }): Promise<void> {
    await this.startPlugins();
    await this.startNodes();

    const angularPath = path.join(
      __dirname,
      "..",
      "public",
      "dist",
      "unisonht-public"
    );

    return new Promise((resolve) => {
      const port = options?.port || 4201;
      this.app.use(express.static(angularPath));
      this.app.all("/*", (_req, res) => {
        res.sendFile("index.html", { root: angularPath });
      });
      this.app.use(errorHandler);
      this.app.listen(port, () => {
        this.debug(`listening http://localhost:${port}`);
        resolve();
      });
    });
  }

  private async startPlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      const pluginOptions: PluginOptions = {
        server: this,
        app: this.app,
        config: this.config,
      };
      await plugin.initialize?.(pluginOptions);
      if (plugin.handleWebRequest) {
        this.app.use((req, resp, next) => {
          if (plugin.handleWebRequest) {
            plugin.handleWebRequest(req, resp, next, pluginOptions);
          } else {
            next();
          }
        });
      }
    }
  }

  private async startNodes(): Promise<void> {
    for (const nodeConfig of this.config.nodes) {
      const plugin = this.plugins.find((p) => p.id === nodeConfig.pluginId);
      if (!plugin) {
        throw new Error(
          `Could not find plugin: ${nodeConfig.pluginId} for node ${nodeConfig.id}`
        );
      }
      const pluginOptions: PluginOptions = {
        server: this,
        app: this.app,
        config: this.config,
      };
      const nodeOptions: NodeOptions = {
        server: this,
        app: this.app,
        config: this.config,
      };
      const node = await plugin.createNode(nodeConfig, pluginOptions);
      if (node.handleWebRequest) {
        this.app.use((req, resp, next) => {
          if (node.handleWebRequest && this.isNodeActive(node)) {
            node.handleWebRequest(req, resp, next, nodeOptions);
          } else {
            next();
          }
        });
      }
      this.nodes.push(node);
    }
  }

  addPlugin(plugin: IUnisonHTPlugin): void {
    this.plugins.push(plugin);
  }

  isNodeActive(node: UnisonHTNode, currentMode?: string): boolean {
    const nodeOptions: NodeOptions = {
      app: this.app,
      config: this.config,
      server: this,
    };
    return (
      node.isActive?.(nodeOptions) ??
      node.config.activeModes?.includes(currentMode ?? this.mode) ??
      true
    );
  }

  async emitMessage(
    fromNode: UnisonHTNode,
    outputName: string,
    value: any
  ): Promise<void> {
    const currentMode = this.mode;
    for (const edge of this.config.edges) {
      if (
        edge.fromNodeId === fromNode.id &&
        edge.fromNodeOutput === outputName
      ) {
        const toNode = this.nodes.find((n) => n.id === edge.toNodeId);
        if (!toNode) {
          throw new Error(
            `edge connected to non-existing node: ${edge.toNodeId}`
          );
        }
        if (!this.isNodeActive(toNode, currentMode)) {
          this.debug("node %s not active... skipping", toNode.id);
          continue;
        }
        if (!toNode.handleMessage) {
          throw new Error(`node ${toNode.id} missing handleMessage function`);
        }
        this.debug("sending message to %s", toNode.id);
        await toNode.handleMessage(edge.toNodeInput, value);
      }
    }
  }

  async switchMode(newMode: string): Promise<void> {
    this.debug("switching mode to: %s", newMode);
    if (!this.config.modes.includes(newMode)) {
      const err = new Error(`invalid mode: ${newMode}`);
      setStatusCodeOnError(err, StatusCodes.BAD_REQUEST);
      throw err;
    }

    for (const plugin of this.plugins) {
      if (plugin.switchMode) {
        const pluginOptions: PluginOptions = {
          server: this,
          app: this.app,
          config: this.config,
        };
        await plugin.switchMode(newMode, pluginOptions);
      }
    }

    for (const node of this.nodes) {
      if (node.switchMode) {
        const nodeOptions: NodeOptions = {
          server: this,
          app: this.app,
          config: this.config,
        };
        await node.switchMode(newMode, nodeOptions);
      }
    }

    this._mode = newMode;
  }

  get mode(): string {
    return this._mode;
  }

  get nodes(): UnisonHTNode[] {
    return this._nodes;
  }

  get config(): UnisonHTConfig {
    return this._config;
  }
}

function errorHandler(
  err: Error,
  _req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  res: Response<any, Record<string, any>, number>,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(getStatusCodeFromError(err) ?? 500);
  res.json({ error: err.message });
}
