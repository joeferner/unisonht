import express, { Express } from "express";
import Debug from "debug";
import swaggerUi from "swagger-ui-express";
import { createRouter, routerUpdateSwaggerJson } from "./routes";
import path from "path";
import { Config } from "./types/Config";
import { getStatusCodeFromError } from "./types/ErrorWithStatusCode";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Device, DeviceFactory } from "./types/Device";
import { IrTxRx, IrTxRxFactory } from "./types/IrTxRx";
import { Mode } from "./types/Mode";

export class UnisonHTServer {
  private readonly debug = Debug("unisonht:unisonht:server");
  private readonly app: Express;
  private readonly deviceFactories: DeviceFactory[] = [];
  private readonly irTxRxFactories: IrTxRxFactory[] = [];
  private readonly _devices: Device[] = [];
  private readonly _modes: Mode[] = [];
  private readonly _config: Config;
  private _modeId?: string;
  private _irTxRx?: IrTxRx;

  constructor(config?: Config) {
    const swaggerJson = require(path.join(
      __dirname,
      "..",
      "dist",
      "swagger.json"
    ));
    this._config = {
      version: 1,
      defaultModeId: "OFF",
      modes: [{ id: "zzz", name: "OFF", buttons: [] }],
      devices: [],
      ...config,
    };

    this.app = express();
    this.app.use(express.json());
    this.app.get("/swagger.json", async (_req, resp) => {
      const newSwaggerJson = JSON.parse(JSON.stringify(swaggerJson));

      routerUpdateSwaggerJson(this, newSwaggerJson);
      this.irTxRx?.updateSwaggerJson(newSwaggerJson);
      this.modes.forEach((mode) => {
        mode.updateSwaggerJson(newSwaggerJson);
      });
      this.devices.forEach((device) => {
        device.updateSwaggerJson(newSwaggerJson);
      });

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
    await this.createIrTxRx();
    await this.createModes();
    await this.createDevices();
    await this.switchMode(this.config.defaultModeId);

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

  private async createIrTxRx(): Promise<void> {
    if (this.config.irTxRx) {
      const irTxRxFactoryId = this.config.irTxRx.irTxRxFactoryId;
      const irTxRxFactory = this.irTxRxFactories.find(
        (i) => i.id === irTxRxFactoryId
      );
      if (!irTxRxFactory) {
        throw new Error(`Could not find IR Tx/Rx factory: ${irTxRxFactoryId}`);
      }
      const irTxRx = await irTxRxFactory.createIrTxRx(this, this.config.irTxRx);
      this.app.use((req, resp, next) => {
        irTxRx.handleWebRequest(req, resp, next);
      });

      this._irTxRx = irTxRx;
    }
  }

  private async createModes(): Promise<void> {
    for (const modeConfig of this.config.modes) {
      const mode = new Mode(this, modeConfig);
      this.app.use((req, resp, next) => {
        if (this.modeId === mode.id) {
          mode.handleWebRequest(req, resp, next);
        } else {
          next();
        }
      });
      this._modes.push(mode);
    }
  }

  private async createDevices(): Promise<void> {
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

  addDeviceFactory(deviceFactory: DeviceFactory): void {
    this.deviceFactories.push(deviceFactory);
  }

  addIrTxRxFactory(irTxRxFactory: IrTxRxFactory): void {
    this.irTxRxFactories.push(irTxRxFactory);
  }

  async switchMode(
    newModeId: string,
    deviceInputs?: { [deviceId: string]: string }
  ): Promise<void> {
    const oldModeId = this._modeId;

    this.debug("switching mode: %s -> %s", oldModeId, newModeId);
    if (!this.config.modes.find((m) => m.id === newModeId)) {
      throw new Error(`invalid mode: ${newModeId}`);
    }

    await Promise.all(
      this.devices.map((device) => {
        return device.switchMode(oldModeId, newModeId);
      })
    );

    if (deviceInputs) {
      await Promise.all(
        Object.keys(deviceInputs).map((deviceId) => {
          const input = deviceInputs[deviceId];
          const device = this.devices.find((d) => d.id === deviceId);
          if (!device) {
            throw new Error(`could not find device with id: ${deviceId}`);
          }
          return device.switchInput(input);
        })
      );
    }

    this._modeId = newModeId;
  }

  get modeId(): string | undefined {
    return this._modeId;
  }

  get config(): Config {
    return this._config;
  }

  get devices(): Device[] {
    return this._devices;
  }

  get modes(): Mode[] {
    return this._modes;
  }

  get irTxRx(): IrTxRx | undefined {
    return this._irTxRx;
  }
}
