import { UnisonHTDevice } from '../UnisonHTDevice';
import { NextFunction, UnisonHT } from '../UnisonHT';
import { DeviceStatus } from '../DeviceStatus';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import Debug from 'debug';

const debug = Debug('UnisonHT:ExampleDevice');

export class ExampleDevice implements UnisonHTDevice {
  public getDeviceName(): string {
    return 'example';
  }

  public async initialize(unisonht: UnisonHT): Promise<void> {
    // do nothing
  }

  public async getStatus(): Promise<DeviceStatus> {
    return {};
  }

  public async handleKeyPress(
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> {
    debug(`key press: ${key}`);
    next();
  }
}
