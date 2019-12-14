import { ButtonPressRequestCallback, RequestCallback } from './index';

export interface DeviceInitOptions {
  onGet(url: string, handler: RequestCallback): void;

  onPost(url: string, handler: RequestCallback): void;

  onPut(url: string, handler: RequestCallback): void;

  onDelete(url: string, handler: RequestCallback): void;

  onButtonPress(url: string, handler: ButtonPressRequestCallback): void;
}
