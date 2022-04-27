import { UnisonHTServer } from "../UnisonHTServer";
import { PluginConfig } from "./Config";
import { OpenApi } from "./openApi/v3/OpenApi";
import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import express from "express";
import Debug from "debug";

export interface PluginFactory {
  get id(): string;

  createPlugin(server: UnisonHTServer, config: PluginConfig): Promise<Plugin>;
}

export abstract class Plugin {
  protected readonly debug = Debug(`unisonht:unisonht:plugin:${this.id}`);
  protected readonly router: express.Router;

  constructor(
    protected readonly server: UnisonHTServer,
    protected readonly config: PluginConfig
  ) {
    this.router = express.Router();
  }

  updateSwaggerJson(swaggerJson: OpenApi): void {}

  handleWebRequest(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction
  ): void {
    this.router(req, resp, next);
  }

  get id(): string {
    return this.config.id;
  }
}
