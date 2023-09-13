import { Key } from "../../keys";
import { LircEvent } from "./lirc";

export interface KeyDecodeResult {
  key: Key | string;
  repeat: number;
}

export interface LircRemote {
  readonly name: string;

  decode?: (event: LircEvent) => boolean | KeyDecodeResult;
}
