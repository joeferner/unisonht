import { Key } from "../../keys";
import { LircEventWriter } from "./LircEventWriter";
import { LircEvent } from "./lirc";

export interface KeyDecodeResult {
  key: Key | string;
  repeat: number;
}

export interface LircRemote {
  readonly name: string;

  readonly displayName: string;

  readonly keyNames: string[];

  decode?: (event: LircEvent) => boolean | KeyDecodeResult;

  transmit(tx: LircEventWriter, key: string): Promise<boolean>;
}
