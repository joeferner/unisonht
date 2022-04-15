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

export interface UnisonHTNode {
  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: NodeOptions
  ): void;

  updateSwaggerJson?(swaggerJson: OpenApi, options: NodeOptions): void;
}

export interface NodeOptions {
  app: Express;
  config: UnisonHTConfig;
}
