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

  get name(): string;

  get config(): UnisonHTNodeConfig;

  get inputs(): NodeInput[];

  get outputs(): NodeOutput[];

  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: NodeOptions
  ): void;

  updateSwaggerJson?(swaggerJson: OpenApi, options: NodeOptions): void;

  handleMessage?(inputName: string, value: any): Promise<void>;

  isActive?(options: NodeOptions): boolean;

  switchMode?(
    oldMode: string,
    newMode: string,
    nodeOptions: NodeOptions
  ): Promise<void>;
}

export interface NodeOptions {
  server: UnisonHTServer;
  config: UnisonHTConfig;
}

export interface NodeInput {
  name: string;
}

export interface NodeOutput {
  name: string;
}
