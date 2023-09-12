import { UnisonHT } from "./UnisonHT";

export interface UnisonHTModule {
  init?: (unisonht: UnisonHT) => Promise<void>;
}
