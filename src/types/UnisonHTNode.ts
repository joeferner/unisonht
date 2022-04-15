import { Express } from "express";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "../UnisonHTServer";
import { OpenApi } from "./openApi/v3/OpenApi";
import { UnisonHTConfig, UnisonHTNodeConfig } from "./UnisonHTConfig";

export interface UnisonHTNode {
  get id(): string;

  get config(): UnisonHTNodeConfig;

  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: NodeOptions
  ): void;

  updateSwaggerJson?(swaggerJson: OpenApi, options: NodeOptions): void;

  handleMessage?(inputName: string, value: any): Promise<void>;

  isActive?(options: NodeOptions): boolean;

  switchMode?(newMode: string, nodeOptions: NodeOptions): Promise<void>;
}

export interface NodeOptions {
  server: UnisonHTServer;
  app: Express;
  config: UnisonHTConfig;
}
