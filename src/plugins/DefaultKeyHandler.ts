import { SupportedKeys, UnisonHTPlugin } from '../UnisonHTPlugin';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { NextFunction, UnisonHT } from '../UnisonHT';

export class DefaultKeyHandler implements UnisonHTPlugin {
  public async initialize(unisonht: UnisonHT): Promise<void> {
    unisonht.post(this, '/key/:key', {
      handler: this.handleKeyPressRoute.bind(this),
    });
  }

  public async handleKeyPressRoute(
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> {
    const key = request.parameters.key;
    await this.handleKeyPress(key, request, response, next);
  }

  public async handleKeyPress(
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: (err?: Error) => void,
  ): Promise<void> {
    await request.unisonht.executePost(`/mode/current/key/${key}`);
  }

  public getSupportedKeys(): SupportedKeys {
    return {};
  }
}
