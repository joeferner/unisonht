import { Request } from "express";
import { UnisonHT, UnisonHTEvent } from "./UnisonHT";

export interface UnisonHTModule {
  readonly name: string;

  init?: (unisonht: UnisonHT) => Promise<void>;

  handle(unisonht: UnisonHT, event: UnisonHTEvent): Promise<boolean>;

  getHtml(unisonht: UnisonHT, params: GetHtmlParams): Promise<string>;
}

export interface GetHtmlParams {
  request: Request;
}
