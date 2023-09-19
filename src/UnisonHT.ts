import express, { Express, NextFunction, Request, Response } from "express";
import { UnisonHTModule } from "./UnisonHTModule";
import { Key } from "./keys";
import { OpenAPI } from "openapi-types";
import { index } from "./pages/index";
import { newNestedError } from "./helpers/NestedError";
import fs from "fs";
import root from "app-root-path";
import path from "path";
import { staticFile } from "./helpers/expressHelpers";
import sass from "sass";

export class UnisonHT {
  private _express: Express;
  private modules: UnisonHTModule[] = [];
  private javascript: { [path: string]: string } = {};
  private css: { [path: string]: string } = {};

  public constructor() {
    this._express = express();
  }

  public async start(options: StartOptions): Promise<void> {
    await this.registerJavascriptPath(path.join(root.path, "build/pages/unisonht.js"));
    await this.registerScssPath(path.join(root.path, "src/pages/unisonht.scss"));

    this._express.get(
      "/bootstrap/bootstrap.min.css",
      staticFile(path.join(root.path, "node_modules/bootstrap/dist/css/bootstrap.min.css")),
    );
    this._express.get(
      "/bootstrap/bootstrap.bundle.min.js",
      staticFile(path.join(root.path, "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js")),
    );
    this._express.get("/unisonht.js", (_req: Request, res: Response) => {
      res.setHeader("content-type", "application/javascript; charset=UTF-8");
      res.send("const exports = {};\n" + Object.values(this.javascript).join("\n\n"));
    });
    this._express.get("/unisonht.css", (_req: Request, res: Response) => {
      res.setHeader("content-type", "text/css; charset=UTF-8");
      res.send(Object.values(this.css).join("\n\n"));
    });
    this._express.get("/", async (_req: Request, res: Response) => {
      res.send(index({ modules: this.modules, content: "Select a module from the menu" }));
    });

    for (const module of this.modules) {
      if (module.init) {
        try {
          await module.init(this);
        } catch (err) {
          throw newNestedError(`failed to initialize: ${module.name}`, err);
        }
      }
      this.registerGetHandler(
        `/module/${module.name}`,
        {},
        async (request: Request, res: Response): Promise<unknown> => {
          const content = await module.getHtml(this, { request });
          return res.send(index({ modules: this.modules, content }));
        },
      );
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

  public async sendButton(remoteName: string, key: Key | string): Promise<void> {
    const event: KeyEvent = {
      type: EventType.Key,
      remoteName,
      key,
    };
    await this.sendEvent(event);
  }

  public async sendEvent(event: UnisonHTEvent): Promise<void> {
    for (const module of this.modules) {
      try {
        if (module.handle && (await module.handle(this, event))) {
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

  public async registerJavascriptPath(path: string): Promise<void> {
    if (!this.javascript[path]) {
      this.javascript[path] = await fs.promises.readFile(path, "utf8");
    }
  }

  public async registerScssPath(path: string): Promise<void> {
    if (!this.css[path]) {
      this.css[path] = sass.compileString(await fs.promises.readFile(path, "utf8")).css;
    }
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

  public getModule(name: string): UnisonHTModule | undefined {
    return this.modules.filter((m) => m.name === name)[0];
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
  remoteName: string;
  key: Key | string;
}

export interface ErrorEvent {
  type: EventType.Error;
  error: unknown;
  sourceEvent: UnisonHTEvent;
}

export type UnisonHTEvent = KeyEvent | ErrorEvent;
