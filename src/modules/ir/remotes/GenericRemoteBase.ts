import { sleep } from "../../../helpers/sleep";
import { isString } from "../../../helpers/typeHelpers";
import { Key } from "../../../keys";
import { LircEventWriter } from "../LircEventWriter";
import { KeyDecodeResult, LircRemote } from "../LircRemote";
import { LircEvent, LircProto, timestampDeltaMillis } from "../lirc";

export type PartialKey = { [value: string]: Key | PartialKey };

export interface GenericRemoteBaseOptions {
  protocol: LircProto;
  keyMap: { [value: string]: Key | PartialKey };
  repeatCount: number;
  repeatGapMillis: number;
  repeatGapMapMillis: number;
  displayName?: string;
}

export abstract class GenericRemoteBase implements LircRemote {
  private readonly _name: string;
  private readonly _displayName: string;
  private readonly protocol: LircProto;
  private readonly keyMap: { [value: string]: Key | PartialKey };
  private readonly invertedKeyMap: { [key: string]: string };
  private readonly repeatCount: number;
  private readonly repeatGapMillis: number;
  private readonly repeatGapMaxMillis: number;
  private lastEventTime?: bigint;
  private lastKey?: Key | string;
  private repeat = 0;
  private partial: PartialKey | undefined;

  public constructor(name: string, options: GenericRemoteBaseOptions) {
    this._name = name;
    this._displayName = options.displayName ?? name;
    this.protocol = options.protocol;
    this.keyMap = options.keyMap;
    this.invertedKeyMap = invertKeyMap(options.keyMap);
    this.repeatCount = options.repeatCount;
    this.repeatGapMillis = options.repeatGapMillis;
    this.repeatGapMaxMillis = options.repeatGapMapMillis;
  }

  public get name(): string {
    return this._name;
  }

  public get displayName(): string {
    return this._displayName;
  }

  public get keyNames(): string[] {
    return Object.keys(this.invertedKeyMap);
  }

  public decode(event: LircEvent): KeyDecodeResult | boolean {
    if (event.rcProto !== this.protocol) {
      return false;
    }

    let key: PartialKey | Key | string | undefined;

    if (this.partial) {
      key = this.partial[Number(event.scanCode).toString(16)];
    } else {
      this.partial = undefined;
      key = this.keyMap[Number(event.scanCode).toString(16)];
    }

    if (isString(key)) {
      const dt = (): number => timestampDeltaMillis(event.timestamp, this.lastEventTime ?? BigInt(0));
      if (key === this.lastKey && dt() < this.repeatGapMaxMillis) {
        this.repeat++;
      } else {
        this.repeat = 0;
      }
      this.partial = undefined;
      this.lastEventTime = event.timestamp;
      this.lastKey = key;
      if (this.repeat % this.repeatCount !== 0) {
        return true;
      }
      return { key, repeat: this.repeat / this.repeatCount };
    } else if (key) {
      this.lastEventTime = event.timestamp;
      this.partial = key;
      return true;
    }

    return false;
  }

  public async transmit(tx: LircEventWriter, key: string): Promise<boolean> {
    const scanCodes = this.invertedKeyMap[key]?.split(" ");
    if (scanCodes) {
      for (let i = 0; i < this.repeatCount; i++) {
        for (const scanCode of scanCodes) {
          await tx.send(this.protocol, BigInt(`0x${scanCode}`));
          await sleep(this.repeatGapMillis);
        }
      }
      await sleep(this.repeatGapMaxMillis);
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
