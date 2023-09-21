import { Key } from "../../../keys";
import { LircProto } from "../lirc";
import { GenericRemoteBase, PartialKey } from "./GenericRemoteBase";

export class DenonRemote extends GenericRemoteBase {
  public constructor(name: string, displayName?: string) {
    super(name, {
      keyMap: KEY_MAP,
      protocol: LircProto.SHARP,
      repeatCount: 3,
      repeatGapMillis: 130,
      repeatGapMapMillis: 200,
      displayName,
    });
  }
}

const KEY_MAP: { [value: string]: Key | PartialKey } = {
  "2e1": Key.POWER_ON,
  "2e2": Key.POWER_OFF,
  cdf: Key.DIMMER,
  "2c4": Key.INPUT_CD,
  "2c8": Key.INPUT_DBS,
  "2e3": Key.INPUT_DVD,
  cb6: Key.INPUT_MODE,
  "2dc": Key.INPUT_MODE_ANALOG,
  cb5: Key.INPUT_MODE_EXT_IN,
  "2c3": Key.INPUT_PHONO,
  "2d2": Key.INPUT_TAPE,
  "2c5": Key.INPUT_TUNER,
  "2c9": Key.INPUT_TV,
  "2cc": Key.INPUT_V_AUX,
  "2cd": Key.INPUT_VCR1,
  "2ce": Key.INPUT_VCR2,
  "2ca": Key.INPUT_VDP,
  ca8: Key.MODE_5CH_7CH,
  "495": Key.MODE_CINEMA,
  "2e6": Key.MODE_DSP_SIMU,
  "497": Key.MODE_GAME,
  "496": Key.MODE_MUSIC,
  "26a": Key.MODE_PURE_DIRECT,
  "2e4": Key.MODE_STANDARD,
  c9d: Key.MODE_STEREO,
  c82: Key.MODE_SURROUND_BACK,
  "2df": Key.ON_SCREEN,
  "27a": Key.POWER_OFF_MAIN,
  "279": Key.POWER_ON_MAIN,
  cd6: Key.PRESET_NEXT,
  cd5: Key.PRESET_PREVIOUS,
  "49d": Key.ROOM_EQ,
  "2ed": Key.SPEAKER,
  ca1: Key.SURROUND_PARAMETER,
  ca0: Key.SYSTEM_SETUP,
  "2ea": Key.TEST_TONE,
  cd7: Key.TUNER_BAND,
  ccc: Key.TUNER_MEMORY,
  cd8: Key.TUNER_MODE,
  ccd: Key.TUNER_SHIFT,
  cb2: Key.VIDEO_OFF,
  "2d8": Key.VIDEO_SELECT,
  "2f1": Key.VOLUME_UP,
  "2f2": Key.VOLUME_DOWN,
  cd9: Key.CHANNEL_UP,
  cda: Key.CHANNEL_DOWN,
  ca3: Key.DIR_UP,
  ca4: Key.DIR_DOWN,
  c7f: Key.DIR_LEFT,
  "2dd": Key.DIR_RIGHT,
  "2e0": Key.SELECT,
  "2f0": Key.MUTE,
  cc1: Key.NUM_1,
  cc2: Key.NUM_2,
  cc3: Key.NUM_3,
  cc4: Key.NUM_4,
  cc5: Key.NUM_5,
  cc6: Key.NUM_6,
  cc7: Key.NUM_7,
  cc8: Key.NUM_8,
  cc9: Key.NUM_9,
  cca: Key.NUM_0,
};
