import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "../UnisonHTServer";
import { OpenApi } from "./openApi/v3/OpenApi";
import { UnisonHTConfig, UnisonHTDeviceConfig } from "./UnisonHTConfig";

export abstract class UnisonHTDevice {
  constructor(
    private readonly _id: string,
    private readonly _config: UnisonHTDeviceConfig,
    private readonly _server: UnisonHTServer
  ) {}

  get id(): string {
    return this._id;
  }

  get config(): UnisonHTDeviceConfig {
    return this._config;
  }

  get server(): UnisonHTServer {
    return this._server;
  }

  updateSwaggerJson(swaggerJson: OpenApi): Promise<void> {
    return Promise.resolve();
  }

  handleWebRequest(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction
  ): void {
    next();
  }

  switchMode(oldMode: string | undefined, newMode: string): Promise<void> {
    return Promise.resolve();
  }

  protected shouldBeActiveForMode(mode: string): boolean {
    return this.config.activeModes.includes(mode) ?? false;
  }

  isActive(): boolean {
    return this.shouldBeActiveForMode(this.server.mode ?? "NOT SET");
  }

  abstract getPowerState(): Promise<PowerState>;
}

export enum PowerState {
  ON = "ON",
  OFF = "OFF",
}
