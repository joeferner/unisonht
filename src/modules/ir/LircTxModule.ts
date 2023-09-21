import root from "app-root-path";
import { Mutex, withTimeout } from "async-mutex";
import debug from "debug";
import { Request, Response } from "express";
import { OpenAPI } from "openapi-types";
import path from "path";
import { EventType, UnisonHT, UnisonHTEvent } from "../../UnisonHT";
import { GetHtmlParams, UnisonHTModule } from "../../UnisonHTModule";
import { isString } from "../../helpers/typeHelpers";
import { LircEventWriter } from "./LircEventWriter";
import { LircRemote } from "./LircRemote";
import { lircTxIndex } from "./pages/lircTxIndex";
import { renderJSXElement } from "../../helpers/jsx";

const log = debug("unisonht:lirc:tx");

export class LircTxModule implements UnisonHTModule {
  private readonly _name: string;
  private readonly _displayName: string;
  private readonly path: string;
  private tx?: LircEventWriter;
  private remotes: LircRemote[];
  private mutex = withTimeout(new Mutex(), 5000);

  public constructor(path: string, options: LircTxModuleOptions) {
    this.path = path;
    this._name = options.name ?? "lirc-tx";
    this._displayName = options.displayName ?? options.name ?? "LIRC: Tx";
    this.remotes = options.remotes;
  }

  public get name(): string {
    return this._name;
  }

  public get displayName(): string {
    return this._displayName;
  }

  public async init(unisonht: UnisonHT): Promise<void> {
    await unisonht.registerJavascriptPath(path.join(root.path, "build/modules/ir/pages/lirc.js"));
    await unisonht.registerScssPath(path.join(root.path, "src/modules/ir/pages/lircTx.scss"));
    for (const remote of this.remotes) {
      unisonht.registerPostHandler(
        `/module/${this.name}/${remote.name}`,
        createTransmitKeyOpenApi(remote),
        async (req: Request, res: Response): Promise<unknown> => {
          return this.handleTransmitKeyPost(unisonht, remote, req, res);
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
      const remote = this.remotes.filter((r) => r.name === event.remoteName)[0];
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
    return renderJSXElement(lircTxIndex({ moduleName: this.name, remotes: this.remotes }));
  }

  private async handleTransmitKeyPost(
    unisonht: UnisonHT,
    remote: LircRemote,
    req: Request,
    res: Response,
  ): Promise<unknown> {
    if (!this.tx) {
      throw new Error("lirc writer not initialized");
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

    log(`transmit (remote: "${remote.name}", key: "${key}")`);
    await unisonht.sendButton(remote.name, key);
    return res.json({});
  }
}

function createTransmitKeyOpenApi(remote: LircRemote): OpenAPI.Operation {
  return {
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
  };
}

export interface LircTxModuleOptions {
  remotes: LircRemote[];
  name?: string;
  displayName?: string;
}
