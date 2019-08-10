import { NextFunction, UnisonHT } from './UnisonHT';
import { RouteHandlerRequest } from './RouteHandlerRequest';
import { RouteHandlerResponse } from './RouteHandlerResponse';

export interface SupportedButton {
  name: string;
  description?: string;

  handleButtonPress(
    button: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void>;
}

export interface SupportedButtons {
  [button: string]: SupportedButton;
}

export interface UnisonHTPlugin {
  initialize?(unisonht: UnisonHT): Promise<void>;

  handleButtonPress?(
    button: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void>;

  getSupportedButtons(): SupportedButtons;
}
