import { UnisonHTDevice } from '../UnisonHTDevice';
import { UnisonHT } from '../UnisonHT';
import { DeviceStatus } from '../DeviceStatus';
import Debug from 'debug';
import { SupportedKeys } from '../UnisonHTPlugin';

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

  public getSupportedKeys(): SupportedKeys {
    return {};
  }
}
