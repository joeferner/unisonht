import { Mutex, withTimeout } from "async-mutex";
import debug from "debug";
import { NextFunction, Request, Response } from "express";
import { EventType, UnisonHT, UnisonHTEvent } from "../../UnisonHT";
import { GetHtmlParams, UnisonHTModule } from "../../UnisonHTModule";
import { isString } from "../../helpers/typeHelpers";
import { LircEventWriter } from "./LircEventWriter";
import { LircRemote } from "./LircRemote";
import { lircTxIndex } from "./pages/lircTxIndex";
import root from "app-root-path";
import path from "path";

const log = debug("unisonht:lirc:tx");

export class LircTxModule implements UnisonHTModule {
  private path: string;
  private tx?: LircEventWriter;
  private remotes: LircRemote[];
  private mutex = withTimeout(new Mutex(), 5000);

  public constructor(path: string, options: { remotes: LircRemote[] }) {
    this.path = path;
    this.remotes = options.remotes;
  }

  public get name(): string {
    return "lirc-tx";
  }

  public async init(unisonht: UnisonHT): Promise<void> {
    await unisonht.registerJavascriptPath(path.join(root.path, "build/modules/ir/pages/lirc.js"));
    for (const remote of this.remotes) {
      unisonht.registerPostHandler(
        `/module/${this.name}/${remote.name}`,
        {
          description: "Transmits the given key via the specified remote",
          parameters: [
            {
              name: "key",
              in: "query",
              description: "The key to transmit",
              schema: {
                type: "string",
                enum: remote.keyNames,
              },
            },
          ],
        },
        async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
          if (!this.tx) {
            return next(new Error("lirc writer not initialized"));
          }

          const key = req.query["key"];
          if (!key) {
            return res.status(400).send('"key" is required');
          }
          if (!isString(key)) {
            return res.status(400).send('"key" must be a string');
          }
          if (!remote.keyNames.includes(key)) {
            return res.status(404).send(`"${key}" not found on remote`);
          }

          log(`transmit ${remote.name} ${key}`);
          if (await remote.transmit(this.tx, key)) {
            return res.json({});
          } else {
            return next(new Error("could not transmit"));
          }
        },
      );
    }

    this.tx = new LircEventWriter();
    this.tx.open(this.path);
    log("initialized");
  }

  public async handle(_unisonht: UnisonHT, event: UnisonHTEvent): Promise<boolean> {
    if (this.tx && event.type === EventType.Key) {
      const tx = this.tx;
      const remote = this.remotes.filter((r) => r.name === event.name)[0];
      if (remote) {
        return await this.mutex.runExclusive(async () => {
          log(`transmitting ${event.key} via remote ${remote.name}`);
          return await remote.transmit(tx, event.key);
        });
      }
    }
    return false;
  }

  public async getHtml(_unisonht: UnisonHT, _params: GetHtmlParams): Promise<string> {
    return lircTxIndex({ moduleName: this.name, remotes: this.remotes });
  }
}
