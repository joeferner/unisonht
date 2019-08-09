import { NextFunction, UnisonHT } from './UnisonHT';
import { RouteHandlerRequest } from './RouteHandlerRequest';
import { RouteHandlerResponse } from './RouteHandlerResponse';

export interface UnisonHTPlugin {
  initialize?(unisonht: UnisonHT): Promise<void>;

  handleKeyPress(
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void>;
}
