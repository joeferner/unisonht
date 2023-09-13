import { Key } from "../../../keys";
import { LircProto } from "../lirc";
import { GenericRemoteBase, PartialKey } from "./GenericRemoteBase";

export class PioneerRemote extends GenericRemoteBase {
  public constructor(name: string) {
    super(name, {
      keyMap: KEY_MAP,
      protocol: LircProto.NEC,
      repeatCount: 2,
      repeatGapMillis: 130,
      repeatGapMapMillis: 200,
    });
  }
}

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
