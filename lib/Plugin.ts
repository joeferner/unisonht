import {UnisonHT} from "../";
import * as express from "express";

export class Plugin {
  private pathPrefix: string;

  constructor(pathPrefix: string) {
    this.pathPrefix = pathPrefix;
  }

  start(unisonht: UnisonHT): Promise<void> {
    unisonht.getApp().get(`${this.getPathPrefix()}`, this.handleGetStatus.bind(this));
    return Promise.resolve();
  }

  protected handleGetStatus(req: express.Request, res: express.Response, next: express.NextFunction): void {
    this.getStatus()
      .then((status) => {
        res.json(status);
      })
      .catch(next);
  }

  getStatus(): Promise<Plugin.Status> {
    return Promise.resolve({});
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }

  getPathPrefix(): string {
    return this.pathPrefix;
  }

  toString(): string {
    return this.pathPrefix;
  }
}

export module Plugin {
  export interface Status {

  }
}