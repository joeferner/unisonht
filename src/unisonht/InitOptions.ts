import { RequestCallback, UnisonHT } from './index';

export interface InitOptions {
  app: UnisonHT;

  onGet(url: string, handler: RequestCallback): void;

  onPost(url: string, handler: RequestCallback): void;

  onPut(url: string, handler: RequestCallback): void;

  onDelete(url: string, handler: RequestCallback): void;
}