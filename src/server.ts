import express, { Express } from "express";
import Debug from "debug";
import swaggerUi from "swagger-ui-express";
import { router } from "./routes";
import { IUnisonHTPlugin } from "./types/IUnisonHTPlugin";
import path from "path";
import { UnisonHTConfig } from "./types/UnisonHTConfig";
import { UnisonHTNode } from "./types/UnisonHTNode";

const debug = Debug("unisonht:server");

export class Server {
  private readonly app: Express;
  private readonly plugins: IUnisonHTPlugin[] = [];
  private readonly nodes: UnisonHTNode[] = [];
  private config: UnisonHTConfig;

  constructor(config?: UnisonHTConfig) {
    const swaggerJson = require(path.join(
      __dirname,
      "..",
      "dist",
      "swagger.json"
    ));
    this.config = {
      nodes: [],
      ...config,
    };

    this.app = express();
    this.app.use(express.json());
    this.app.get("/swagger.json", (req, resp) => {
      const newSwaggerJson = JSON.parse(JSON.stringify(swaggerJson));
      
      for (const plugin of this.plugins) {
        const pluginOptions = { app: this.app, config: this.config };
        plugin.updateSwaggerJson?.(newSwaggerJson, pluginOptions);
      }

      for (const node of this.nodes) {
        const nodeOptions = { app: this.app, config: this.config };
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
    this.app.use(router);
  }

  async start(options?: { port?: number }): Promise<void> {
    for (const plugin of this.plugins) {
      const pluginOptions = { app: this.app, config: this.config };
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

    for (const nodeConfig of this.config.nodes) {
      const plugin = this.plugins.find((p) => p.id === nodeConfig.pluginId);
      if (!plugin) {
        throw new Error(
          `Could not find plugin: ${nodeConfig.pluginId} for node ${nodeConfig.id}`
        );
      }
      const pluginOptions = { app: this.app, config: this.config };
      const nodeOptions = { app: this.app, config: this.config, nodeConfig };
      const node = await plugin.createNode(nodeConfig, pluginOptions);
      if (node.handleWebRequest) {
        this.app.use((req, resp, next) => {
          if (node.handleWebRequest) {
            node.handleWebRequest(req, resp, next, nodeOptions);
          } else {
            next();
          }
        });
      }
      this.nodes.push(node);
    }

    return new Promise((resolve) => {
      const port = options?.port || 4201;
      this.app.listen(port, () => {
        debug(`listening http://localhost:${port}`);
        resolve();
      });
    });
  }

  addPlugin(plugin: IUnisonHTPlugin): void {
    this.plugins.push(plugin);
  }
}
