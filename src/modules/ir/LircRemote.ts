import { Key } from "../../keys";
import { LircEventWriter } from "./LircEventWriter";
import { LircEvent } from "./lirc";

export interface KeyDecodeResult {
  key: Key | string;
  repeat: number;
}

export interface ButtonLayout {
  width: number;
  height: number;
  buttons: ButtonLayoutButton[];
}

export interface ButtonLayoutButton {
  left: number;
  top: number;
  width: number;
  height: number;
  key: Key | string;
  displayName: string;
}

export interface LircRemote {
  readonly name: string;

  readonly displayName: string;

  readonly keyNames: string[];

  readonly buttonLayout?: ButtonLayout;

  decode?: (event: LircEvent) => boolean | KeyDecodeResult;

  transmit(tx: LircEventWriter, key: string): Promise<boolean>;
}
