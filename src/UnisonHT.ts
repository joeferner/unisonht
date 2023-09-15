import express, { Express, NextFunction, Request, Response } from "express";
import { UnisonHTModule } from "./UnisonHTModule";
import { Key } from "./keys";
import { OpenAPI } from "openapi-types";
import { index } from "./pages/index";
import { newNestedError } from "./helpers/NestedError";

export class UnisonHT {
  private _express: Express;
  private modules: UnisonHTModule[] = [];

  public constructor() {
    this._express = express();
  }

  public async start(options: StartOptions): Promise<void> {
    this._express.get("/", async (_req: Request, res: Response) => {
      res.send(index({ modules: this.modules }));
    });

    for (const module of this.modules) {
      if (module.init) {
        try {
          await module.init(this);
        } catch (err) {
          throw newNestedError(`failed to initialize: ${module.name}`, err);
        }
      }
    }

    if (options.port) {
      await UnisonHT.listen(this._express, options.port);
    }
  }

  private static listen(express: Express, port: number | string): Promise<void> {
    return new Promise<void>((resolve) => {
      express.listen(port, () => {
        resolve();
      });
    });
  }

  public use(module: UnisonHTModule): void {
    this.modules.push(module);
  }

  public async sendButton(name: string, key: Key | string): Promise<void> {
    const event: KeyEvent = {
      type: EventType.Key,
      name,
      key,
    };
    await this.sendEvent(event);
  }

  public async sendEvent(event: UnisonHTEvent): Promise<void> {
    for (const module of this.modules) {
      try {
        if (await module.handle(this, event)) {
          return;
        }
      } catch (err) {
        event = {
          type: EventType.Error,
          error: err,
          sourceEvent: event,
        };
      }
    }
    console.error("unhandled event", event);
  }

  public registerGetHandler(
    path: string,
    _openApi: OpenAPI.Operation,
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): void {
    // TODO handle openApi
    this._express.get(path, async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  public registerPostHandler(
    path: string,
    _openApi: OpenAPI.Operation,
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): void {
    // TODO handle openApi
    this._express.post(path, async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }
}

export interface StartOptions {
  port?: string | number;
}

export enum EventType {
  Key = "Key",
  Error = "Error",
}

export interface KeyEvent {
  type: EventType.Key;
  name: string;
  key: Key | string;
}

export interface ErrorEvent {
  type: EventType.Error;
  error: unknown;
  sourceEvent: UnisonHTEvent;
}

export type UnisonHTEvent = KeyEvent | ErrorEvent;
