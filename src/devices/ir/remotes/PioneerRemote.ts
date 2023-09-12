import { Key } from "../../../keys";
import { KeyDecodeResult, LircRemote, PartialDecodeResult } from "../LircRemote";
import { LircEvent, LircProto, timestampDeltaMillis } from "../lirc";

const REPEAT_GAP_MS = 150;

const KEY_MAP: { [value: string]: Key } = {
  "0xaa00": Key.NUM_0,
  "0xaa01": Key.NUM_1,
  "0xaa02": Key.NUM_2,
  "0xaa03": Key.NUM_3,
  "0xaa04": Key.NUM_4,
  "0xaa05": Key.NUM_5,
  "0xaa06": Key.NUM_6,
  "0xaa07": Key.NUM_7,
  "0xaa08": Key.NUM_8,
  "0xaa09": Key.NUM_9
};

const PARTIAL_KEY = 0xaa5a;

const PARTIAL_KEY_MAP: { [value: string]: Key } = {
  "0xaf7a": Key.INPUT_1
};

export class PioneerRemote implements LircRemote {
  private _name: string;
  private lastEventTime?: bigint;
  private lastKey?: Key;
  private repeat = 0;
  private partial = false;

  public constructor(name: string) {
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public decode(event: LircEvent): PartialDecodeResult | KeyDecodeResult | undefined {
    if (event.rcProto !== LircProto.NEC) {
      return undefined;
    }

    let key: Key | undefined;

    if (this.partial) {
      this.partial = false;
      key = PARTIAL_KEY_MAP[`0x${Number(event.scanCode).toString(16)}`];
    } else if (Number(event.scanCode) === PARTIAL_KEY) {
      this.partial = true;
      this.lastEventTime = event.timestamp;
      return { partial: true };
    } else {
      this.partial = false;
      key = KEY_MAP[`0x${Number(event.scanCode).toString(16)}`];
    }

    if (key) {
      const dt = (): number => timestampDeltaMillis(event.timestamp, this.lastEventTime ?? BigInt(0));
      if (key === this.lastKey && dt() < REPEAT_GAP_MS) {
        this.repeat++;
      } else {
        this.repeat = 0;
      }
      this.lastEventTime = event.timestamp;
      this.lastKey = key;
      if (this.repeat % 2 == 1) {
        return { partial: true };
      }
      return { key, repeat: this.repeat / 2 };
    }

    return undefined;
  }
}
