import express, { Express } from "express";
import Debug from "debug";
import swaggerUi from "swagger-ui-express";
import { createRouter } from "./routes";
import {
  UnisonHTNodeFactory,
  CreateNodeOptions,
} from "./types/UnisonHTNodeFactory";
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
import { DeviceOptions, UnisonHTDevice } from "./types/UnisonHTDevice";
import { UnisonHTDeviceFactory } from "./types/UnisonHTDeviceFactory";
import { debug } from "console";

export class UnisonHTServer {
  private readonly debug = Debug("unisonht:server");
  private readonly app: Express;
  private readonly deviceFactories: UnisonHTDeviceFactory[] = [];
  private readonly nodeFactories: UnisonHTNodeFactory[] = [];
  private readonly devices: UnisonHTDevice[] = [];
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
      version: 1,
      defaultMode: "OFF",
      modes: ["OFF"],
      devices: [],
      nodes: [],
      edges: [],
      ...config,
    };
    this._mode = this.config.defaultMode;

    this.app = express();
    this.app.use(express.json());
    this.app.get("/swagger.json", (req, resp) => {
      const newSwaggerJson = JSON.parse(JSON.stringify(swaggerJson));

      for (const device of this.devices) {
        const deviceOptions: DeviceOptions = {
          server: this,
          config: this.config,
        };
        device.updateSwaggerJson?.(newSwaggerJson, deviceOptions);
      }

      for (const node of this.nodes) {
        const nodeOptions: NodeOptions = {
          server: this,
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
    await this.startDevices();
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

  private async startDevices(): Promise<void> {
    for (const deviceConfig of this.config.devices) {
      const deviceFactory = this.deviceFactories.find(
        (d) => d.id === deviceConfig.deviceFactoryId
      );
      if (!deviceFactory) {
        throw new Error(
          `Could not find device factory: ${deviceConfig.deviceFactoryId} for node ${deviceConfig.id}`
        );
      }
      const device = await deviceFactory.createDevice(deviceConfig, {
        server: this,
        config: this.config,
      });

      if (device.handleWebRequest) {
        const deviceOptions: NodeOptions = {
          server: this,
          config: this.config,
        };
        this.app.use((req, resp, next) => {
          if (device.handleWebRequest && this.isActive(device)) {
            device.handleWebRequest(req, resp, next, deviceOptions);
          } else {
            next();
          }
        });
      }

      this.devices.push(device);
    }
  }

  private async startNodes(): Promise<void> {
    for (const nodeConfig of this.config.nodes) {
      let node: UnisonHTNode;

      if (nodeConfig.nodeFactoryId) {
        const nodeFactory = this.nodeFactories.find(
          (p) => p.id === nodeConfig.nodeFactoryId
        );
        if (!nodeFactory) {
          throw new Error(
            `Could not find node factory: ${nodeConfig.nodeFactoryId} for node ${nodeConfig.id}`
          );
        }
        node = await nodeFactory.createNode(nodeConfig, {
          server: this,
          config: this.config,
        });
      } else if (nodeConfig.deviceId) {
        const device = this.devices.find((p) => p.id === nodeConfig.deviceId);
        if (!device) {
          throw new Error(
            `Could not find device: ${nodeConfig.deviceId} for node ${nodeConfig.id}`
          );
        }
        node = await device.createNode(nodeConfig, {
          server: this,
          config: this.config,
        });
      } else {
        throw new Error(
          `required either "nodeFactoryId" or "deviceId" for node: ${nodeConfig.id}`
        );
      }

      if (node.handleWebRequest) {
        const nodeOptions: NodeOptions = {
          server: this,
          config: this.config,
        };
        this.app.use((req, resp, next) => {
          if (node.handleWebRequest && this.isActive(node)) {
            node.handleWebRequest(req, resp, next, nodeOptions);
          } else {
            next();
          }
        });
      }

      this.nodes.push(node);
    }
  }

  addNodeFactory(nodeFactory: UnisonHTNodeFactory): void {
    this.nodeFactories.push(nodeFactory);
  }

  addDeviceFactory(deviceFactory: UnisonHTDeviceFactory): void {
    this.deviceFactories.push(deviceFactory);
  }

  isActive(item: UnisonHTNode | UnisonHTDevice, currentMode?: string): boolean {
    const nodeOptions: NodeOptions = {
      config: this.config,
      server: this,
    };
    return (
      item.isActive?.(nodeOptions) ??
      item.config.activeModes?.includes(currentMode ?? this.mode) ??
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
        if (!this.isActive(toNode, currentMode)) {
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

    for (const node of this.nodes) {
      if (node.switchMode) {
        const nodeOptions: NodeOptions = {
          server: this,
          config: this.config,
        };
        await node.switchMode(this._mode, newMode, nodeOptions);
      }
    }

    this._mode = newMode;
  }

  getNodesByDeviceId(deviceId: string): UnisonHTNode[] {
    return this.nodes.filter((node) => node.config.deviceId === deviceId);
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
  debug("error: %o", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(getStatusCodeFromError(err) ?? 500);
  res.json({ error: err.message });
}
