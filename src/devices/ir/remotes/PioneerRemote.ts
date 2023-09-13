import { sleep } from "../../../helpers/sleep";
import { isString } from "../../../helpers/typeHelpers";
import { Key } from "../../../keys";
import { LircEventWriter } from "../LircEventWriter";
import { KeyDecodeResult, LircRemote } from "../LircRemote";
import { LircEvent, LircProto, timestampDeltaMillis } from "../lirc";

const REPEAT_COUNT = 2;
const REPEAT_GAP_MS = 130;
const REPEAT_MAX_GAP_MS = 200;
const PROTOCOL = LircProto.NEC;

type PartialKey = { [value: string]: Key | PartialKey };

const KEY_MAP: { [value: string]: Key | PartialKey } = {
  aa00: Key.NUM_0,
  aa01: Key.NUM_1,
  aa02: Key.NUM_2,
  aa03: Key.NUM_3,
  aa04: Key.NUM_4,
  aa05: Key.NUM_5,
  aa06: Key.NUM_6,
  aa07: Key.NUM_7,
  aa08: Key.NUM_8,
  aa09: Key.NUM_9,
  aa0a: Key.VOLUME_UP,
  aa0b: Key.VOLUME_DOWN,
  aa10: Key.CHANNEL_UP,
  aa11: Key.CHANNEL_DOWN,
  aa1c: Key.POWER_TOGGLE,
  aa24: Key.DIR_RIGHT,
  aa25: Key.DIR_LEFT,
  aa26: Key.DIR_UP,
  aa27: Key.DIR_DOWN,
  aa28: Key.SELECT,
  aa38: Key.RECORD,
  aa45: Key.INPUT_ANT,
  aa49: Key.MUTE,
  aa4a: Key.DISPLAY,
  aa5a: {
    af64: Key.DOT,
    af61: Key.CHANNEL_ENTER,
    af62: Key.CHANNEL_RETURN,
    af74: Key.INPUT_PC,
    af7a: Key.INPUT_1,
    af7b: Key.INPUT_2,
    af7c: Key.INPUT_3,
    af7d: Key.INPUT_4,
    af7e: Key.INPUT_5,
    af7f: Key.INPUT_6,
  },
  aa5b: {
    af20: Key.HOME,
    af22: Key.BACK,
    af24: Key.GUIDE,
    af25: Key.INFO,
    af27: Key.MENU,
    af2a: Key.DAY_PLUS,
    af2b: Key.DAY_MINUS,
    af2c: Key.FAVORITE_B,
    af2d: Key.FAVORITE_C,
    af2e: Key.FAVORITE_D,
    af2f: Key.FAVORITE_A,
    af33: Key.PAGE_UP,
    af34: Key.PAGE_DOWN,
  },
  aa5e: {
    af3a: Key.SIZE,
    af61: Key.AV_SELECTION,
    af70: Key.SLEEP,
  },
};

const INVERTED_KEY_MAP = invertKeyMap(KEY_MAP);

export class PioneerRemote implements LircRemote {
  private _name: string;
  private lastEventTime?: bigint;
  private lastKey?: Key | string;
  private repeat = 0;
  private partial: PartialKey | undefined;

  public constructor(name: string) {
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public decode(event: LircEvent): KeyDecodeResult | boolean {
    if (event.rcProto !== PROTOCOL) {
      return false;
    }

    let key: PartialKey | Key | string | undefined;

    if (this.partial) {
      key = this.partial[Number(event.scanCode).toString(16)];
    } else {
      this.partial = undefined;
      key = KEY_MAP[Number(event.scanCode).toString(16)];
    }

    if (isString(key)) {
      const dt = (): number => timestampDeltaMillis(event.timestamp, this.lastEventTime ?? BigInt(0));
      if (key === this.lastKey && dt() < REPEAT_MAX_GAP_MS) {
        this.repeat++;
      } else {
        this.repeat = 0;
      }
      this.partial = undefined;
      this.lastEventTime = event.timestamp;
      this.lastKey = key;
      if (this.repeat % REPEAT_COUNT !== 0) {
        return true;
      }
      return { key, repeat: this.repeat / REPEAT_COUNT };
    } else if (key) {
      this.lastEventTime = event.timestamp;
      this.partial = key;
      return true;
    }

    return false;
  }

  public async transmit(tx: LircEventWriter, key: string): Promise<boolean> {
    const scanCodes = INVERTED_KEY_MAP[key]?.split(" ");
    if (scanCodes) {
      for (let i = 0; i < REPEAT_COUNT; i++) {
        for (const scanCode of scanCodes) {
          await tx.send(PROTOCOL, BigInt(`0x${scanCode}`));
          await sleep(REPEAT_GAP_MS);
        }
      }
      return true;
    }
    return false;
  }
}

function invertKeyMap(keyMap: PartialKey): { [key: string | Key]: string } {
  const invert = (keyMap: PartialKey, prefix: string): { [key: string | Key]: string } => {
    let result: { [key: string | Key]: string } = {};
    for (const k of Object.keys(keyMap)) {
      const v = keyMap[k];
      const value = prefix.length === 0 ? k : `${prefix} ${k} `;
      if (isString(v)) {
        result[v] = value.trim();
      } else {
        result = {
          ...result,
          ...invert(v, value),
        };
      }
    }
    return result;
  };
  return invert(keyMap, "");
}
