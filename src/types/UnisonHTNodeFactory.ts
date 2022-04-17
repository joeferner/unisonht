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
import { UnisonHTNode } from "./UnisonHTNode";

export interface UnisonHTNodeFactory {
  get id(): string;

  createNode(
    config: UnisonHTNodeConfig,
    options: CreateNodeOptions
  ): Promise<UnisonHTNode>;
}

export interface CreateNodeOptions {
  server: UnisonHTServer;
  config: UnisonHTConfig;
}
