import { UnisonHT, UnisonHTEvent } from "./UnisonHT";

export interface UnisonHTModule {
  readonly name: string;

  init?: (unisonht: UnisonHT) => Promise<void>;

  handle(unisonht: UnisonHT, event: UnisonHTEvent): Promise<boolean>;
}
