import { NextFunction } from './UnisonHT';
import { RouteHandlerRequest } from './RouteHandlerRequest';
import { RouteHandlerResponse } from './RouteHandlerResponse';

export interface ButtonMap {
  [key: string]: (request: RouteHandlerRequest, response: RouteHandlerResponse, next: NextFunction) => Promise<void>;
}
