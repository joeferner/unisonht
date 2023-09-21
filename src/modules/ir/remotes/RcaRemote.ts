import { Key } from "../../../keys";
import { LircProto } from "../lirc";
import { GenericRemoteBase, PartialKey } from "./GenericRemoteBase";

export class RcaRemote extends GenericRemoteBase {
  public constructor(name: string, displayName?: string) {
    super(name, {
      keyMap: KEY_MAP,
      protocol: LircProto.Sony12,
      repeatCount: 3,
      repeatGapMillis: 65,
      repeatGapMapMillis: 200,
      displayName,
    });
  }
}

const KEY_MAP: { [value: string]: Key | PartialKey } = {
  "10015": Key.POWER_TOGGLE,
  "10012": Key.VOLUME_UP,
  "10013": Key.VOLUME_DOWN,
  "10014": Key.MUTE,
};
