import express, { Express, Request, Response } from "express";
import { UnisonHTModule } from "./UnisonHTModule";
import { Key } from "./keys";

export class UnisonHT {
  private express?: Express;
  private modules: UnisonHTModule[] = [];

  public async start(options: StartOptions): Promise<void> {
    this.express = express();

    this.express.get("/", (_req: Request, res: Response) => {
      res.send("Hello, TypeScript Express!");
    });

    for (const module of this.modules) {
      if (module.init) {
        await module.init(this);
      }
    }

    if (options.port) {
      await UnisonHT.listen(this.express, options.port);
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
