import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "../UnisonHTServer";
import { OpenApi } from "./openApi/v3/OpenApi";
import {
  UnisonHTConfig,
  UnisonHTDeviceConfig,
  UnisonHTNodeConfig,
} from "./UnisonHTConfig";
import { UnisonHTNode } from "./UnisonHTNode";

export interface UnisonHTDevice {
  get id(): string;

  get config(): UnisonHTDeviceConfig;

  createNode(
    config: UnisonHTNodeConfig,
    options: CreateNodeOptions
  ): Promise<UnisonHTNode>;

  updateSwaggerJson?(swaggerJson: OpenApi, options: DeviceOptions): void;

  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: DeviceOptions
  ): void;

  isActive?(options: DeviceOptions): boolean;
}

export interface CreateNodeOptions {
  server: UnisonHTServer;
  config: UnisonHTConfig;
}

export interface DeviceOptions {
  server: UnisonHTServer;
  config: UnisonHTConfig;
}
