import debug from "debug";
import { UnisonHTModule } from "../../UnisonHTModule";
import { LircEventWriter } from "./LircEventWriter";

const log = debug("unisonht:lirc:tx");

export class LircTxModule implements UnisonHTModule {
  private path: string;
  private tx?: LircEventWriter;

  public constructor(path: string) {
    this.path = path;
  }

  public async init(): Promise<void> {
    this.tx = new LircEventWriter();
    this.tx.open(this.path);
    log("initialized");
  }
}
