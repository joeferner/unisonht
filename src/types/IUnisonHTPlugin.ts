import { Express } from "express";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { OpenApi } from "./openApi/v3/OpenApi";
import { UnisonHTConfig, UnisonHTNodeConfig } from "./UnisonHTConfig";
import { UnisonHTNode } from "./UnisonHTNode";

export interface IUnisonHTPlugin {
  get id(): string;

  initialize?(options: PluginOptions): Promise<void>;

  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: PluginOptions
  ): void;

  updateSwaggerJson?(swaggerJson: OpenApi, options: PluginOptions): void;

  createNode(config: UnisonHTNodeConfig, options: PluginOptions): Promise<UnisonHTNode>;
}

export interface PluginOptions {
  app: Express;
  config: UnisonHTConfig;
}
