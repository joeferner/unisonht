import Debug from 'debug';
import express from 'express';
import Router from 'express-promise-router';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { UnisonHTServer } from '../UnisonHTServer';
import { PluginConfig } from './Config';
import { OpenApi } from './openApi/v3/OpenApi';

export interface PluginFactory<TConfigData> {
  get id(): string;

  createPlugin(server: UnisonHTServer, config: PluginConfig<TConfigData>): Promise<Plugin<TConfigData>>;
}

export abstract class Plugin<TConfigData> {
  protected readonly debug = Debug(`unisonht:unisonht:plugin:${this.name}:${this.id}`);
  protected readonly router: express.Router;

  constructor(protected readonly server: UnisonHTServer, protected readonly config: PluginConfig<TConfigData>) {
    this.router = Router();
  }

  protected get openApiTags(): string[] {
    return [`Plugin: ${this.config.name}`];
  }

  updateOpenApi(openApi: OpenApi): void {
    // Allow override
  }

  handleWebRequest(req: Request, resp: Response, next: NextFunction): void {
    this.router(req, resp, next);
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  protected get urlPrefix(): string {
    return `/plugin/${this.id}`;
  }

  protected get apiUrlPrefix(): string {
    return `/api/v1/plugin/${this.id}`;
  }
}
