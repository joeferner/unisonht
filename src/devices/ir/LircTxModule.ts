import debug from "debug";
import { EventType, UnisonHT, UnisonHTEvent } from "../../UnisonHT";
import { UnisonHTModule } from "../../UnisonHTModule";
import { LircEventWriter } from "./LircEventWriter";
import { LircRemote } from "./LircRemote";

const log = debug("unisonht:lirc:tx");

export class LircTxModule implements UnisonHTModule {
  private path: string;
  private tx?: LircEventWriter;
  private remotes: LircRemote[];

  public constructor(path: string, options: { remotes: LircRemote[] }) {
    this.path = path;
    this.remotes = options.remotes;
  }

  public async init(): Promise<void> {
    this.tx = new LircEventWriter();
    this.tx.open(this.path);
    log("initialized");
  }

  public async handle(_unisonht: UnisonHT, event: UnisonHTEvent): Promise<boolean> {
    if (this.tx && event.type === EventType.Key) {
      const remote = this.remotes.filter((r) => r.name === event.name)[0];
      if (remote) {
        log(`transmitting ${event.key} via remote ${remote.name}`);
        return await remote.transmit(this.tx, event.key);
      }
    }
    return false;
  }
}
