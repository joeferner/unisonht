import { Key } from "../../../keys";
import { KeyDecodeResult, LircRemote, PartialDecodeResult } from "../LircRemote";
import { LircEvent, LircProto } from "../lirc";

export class PioneerRemote implements LircRemote {
  private _name: string;
  private lastEventTime?: bigint;
  private repeat = 0;

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
    switch (Number(event.scanCode)) {
      case 0xaa00: key = Key.NUM_0; break;
      case 0xaa01: key = Key.NUM_1; break;
      case 0xaa02: key = Key.NUM_2; break;
      case 0xaa03: key = Key.NUM_3; break;
      case 0xaa04: key = Key.NUM_4; break;
      case 0xaa05: key = Key.NUM_5; break;
      case 0xaa06: key = Key.NUM_6; break;
      case 0xaa07: key = Key.NUM_7; break;
      case 0xaa08: key = Key.NUM_8; break;
      case 0xaa09: key = Key.NUM_9; break;
    }
    if (key) {
      if (this.lastEventTime && event.timestamp - this.lastEventTime < 150000000) {
        this.repeat++;
      } else {
        this.repeat = 0;
      }
      this.lastEventTime = event.timestamp;
      return { key, repeat: this.repeat };
    }

    return undefined;
  }
}
