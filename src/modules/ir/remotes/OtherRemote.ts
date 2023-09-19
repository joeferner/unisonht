import { Key } from "../../../keys";
import { LircProto } from "../lirc";
import { GenericRemoteBase, PartialKey } from "./GenericRemoteBase";

export class OtherRemote extends GenericRemoteBase {
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
  "111": Key.POWER_TOGGLE,
  "222": Key.VOLUME_UP,
  "333": Key.VOLUME_DOWN,
};
