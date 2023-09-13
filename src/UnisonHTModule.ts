import { UnisonHT, UnisonHTEvent } from "./UnisonHT";

export interface UnisonHTModule {
  init?: (unisonht: UnisonHT) => Promise<void>;

  handle(unisonht: UnisonHT, event: UnisonHTEvent): Promise<boolean>;
}
