import { Key } from "../../../keys";
import { LircProto } from "../lirc";
import { GenericRemoteBase, PartialKey } from "./GenericRemoteBase";

export class DenonRemote extends GenericRemoteBase {
  public constructor(name: string) {
    super(name, {
      keyMap: KEY_MAP,
      protocol: LircProto.SHARP,
      repeatCount: 3,
      repeatGapMillis: 130,
      repeatGapMapMillis: 200,
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
};
