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

  public send(name: string, key: Key | string): Promise<void> {
    throw new Error(`Method not implemented. ${name}: ${key}`);
  }
}

export interface StartOptions {
  port?: string | number;
}
