import debug from "debug";
import { UnisonHT, UnisonHTEvent } from "../../UnisonHT";
import { GetHtmlParams, UnisonHTModule } from "../../UnisonHTModule";
import { LircEventReader } from "./LircEventReader";
import { KeyDecodeResult, LircRemote } from "./LircRemote";
import { lircProtoToString } from "./lirc";

const log = debug("unisonht:lirc:rx");

export class LircRxModule implements UnisonHTModule {
  private path: string;
  private rx?: LircEventReader;
  private remotes: LircRemote[];

  public constructor(path: string, options: { remotes: LircRemote[] }) {
    this.path = path;
    this.remotes = options.remotes;
  }

  public get name(): string {
    return "lirc-rx";
  }

  public async init(unisonht: UnisonHT): Promise<void> {
    this.rx = new LircEventReader();
    let lastInputEventTimeMillis = 0;
    this.rx.on("input", (evt) => {
      const eventTimestampMillis = Number(evt.timestamp / BigInt(1000) / BigInt(1000));
      const dt = eventTimestampMillis - lastInputEventTimeMillis;
      lastInputEventTimeMillis = eventTimestampMillis;

      for (const remote of this.remotes) {
        if (remote.decode) {
          const result = remote.decode(evt);
          if ((result as KeyDecodeResult)?.key) {
            const decodeResult = result as KeyDecodeResult;
            log(`received ${decodeResult.key} (repeat: ${decodeResult.repeat})`);
            unisonht.sendButton(remote.name, decodeResult.key);
            return;
          } else if (result) {
            return;
          }
        }
      }
      console.error(
        `unhandled ir event ${evt.timestamp}: ${lircProtoToString(evt.rcProto)}(${
          evt.rcProto
        }) 0x${evt.scanCode.toString(16)} (flags: 0x${evt.flags.toString(16)}, keycode: 0x${evt.keycode.toString(
          16,
        )}, dt: ${dt})`,
      );
    });
    await this.rx.open(this.path);
    log("initialized");
  }

  public async handle(_unisonht: UnisonHT, _event: UnisonHTEvent): Promise<boolean> {
    return false;
  }

  public async getHtml(_unisonht: UnisonHT, _params: GetHtmlParams): Promise<string> {
    return "No actions";
  }
}
