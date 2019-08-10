import { ButtonHandler, NextFunction } from './UnisonHT';
import { RouteHandlerResponse } from './RouteHandlerResponse';
import { RouteHandlerRequest } from './RouteHandlerRequest';

export * from './UnisonHT';
export * from './UnisonHTPlugin';
export * from './UnisonHTDevice';
export * from './UnisonHTMode';
export * from './DeviceStatus';
export * from './RouteHandlerRequest';
export * from './RouteHandlerResponse';
export * from './StandardButton';
export * from './NotFoundError';
export * from './ButtonNotFoundError';
export * from './plugins/WebApi';
export * from './plugins/DebugWebUI';

export function sendButtonToDevice(deviceName: string, button?: string): ButtonHandler {
  return async (
    buttonParam: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> => {
    if (!button) {
      button = buttonParam;
    }
    await request.unisonht.redirect(`/device/${deviceName}/button/${button}`, request, response, next);
  };
}
