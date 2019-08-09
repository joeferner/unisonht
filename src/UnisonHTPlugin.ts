import { NextFunction, UnisonHT } from './UnisonHT';
import { RouteHandlerRequest } from './RouteHandlerRequest';
import { RouteHandlerResponse } from './RouteHandlerResponse';

export interface SupportedKey {
  description?: string;
}

export interface SupportedKeys {
  [key: string]: SupportedKey;
}

export interface UnisonHTPlugin {
  initialize?(unisonht: UnisonHT): Promise<void>;

  handleKeyPress(
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void>;

  getSupportedKeys?(): SupportedKeys;
}
