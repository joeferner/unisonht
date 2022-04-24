import express, { Express } from "express";
import Debug from "debug";
import swaggerUi from "swagger-ui-express";
import { createRouter } from "./routes";
import path from "path";
import { UnisonHTConfig } from "./types/UnisonHTConfig";
import { getStatusCodeFromError } from "./types/ErrorWithStatusCode";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTDevice } from "./types/UnisonHTDevice";
import { UnisonHTDeviceFactory } from "./types/UnisonHTDeviceFactory";

export class UnisonHTServer {
  private readonly debug = Debug("unisonht:unisonht:server");
  private readonly app: Express;
  private readonly deviceFactories: UnisonHTDeviceFactory[] = [];
  private readonly _devices: UnisonHTDevice[] = [];
  private readonly _config: UnisonHTConfig;
  private _mode?: string;

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
      ...config,
    };

    this.app = express();
    this.app.use(express.json());
    this.app.get("/swagger.json", async (req, resp) => {
      const newSwaggerJson = JSON.parse(JSON.stringify(swaggerJson));

      await Promise.all(
        this.devices.map((device) => {
          return device.updateSwaggerJson(newSwaggerJson);
        })
      );

      console.log(newSwaggerJson);
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
    await this.switchMode(this.config.defaultMode);

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
      this.app.use(
        (
          err: Error,
          _req: Request<
            ParamsDictionary,
            any,
            any,
            ParsedQs,
            Record<string, any>
          >,
          res: Response<any, Record<string, any>, number>,
          next: NextFunction
        ) => {
          this.debug("error: %o", err);
          if (res.headersSent) {
            return next(err);
          }
          res.status(getStatusCodeFromError(err) ?? 500);
          res.json({ error: err.message });
        }
      );
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
          `Could not find device factory: ${deviceConfig.deviceFactoryId} for device ${deviceConfig.id}`
        );
      }
      const device = await deviceFactory.createDevice(this, deviceConfig);

      this.app.use((req, resp, next) => {
        device.handleWebRequest(req, resp, next);
      });

      this._devices.push(device);
    }
  }

  addDeviceFactory(deviceFactory: UnisonHTDeviceFactory): void {
    this.deviceFactories.push(deviceFactory);
  }

  async switchMode(newMode: string): Promise<void> {
    const oldMode = this._mode;

    this.debug("switching mode: %s -> %s", oldMode, newMode);
    if (!this.config.modes.includes(newMode)) {
      throw new Error(`invalid mode: ${newMode}`);
    }

    await Promise.all(
      this.devices.map((device) => {
        return device.switchMode(oldMode, newMode);
      })
    );

    this._mode = newMode;
  }

  get mode(): string | undefined {
    return this._mode;
  }

  get config(): UnisonHTConfig {
    return this._config;
  }

  get devices(): UnisonHTDevice[] {
    return this._devices;
  }
}
