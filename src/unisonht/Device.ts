import { DeviceInitOptions } from './DeviceInitOptions';
import { UnisonHTRequest } from './UnisonHTRequest';
import { DeviceStatus } from './DeviceStatus';
import { UnisonHT } from './UnisonHT';

export interface Device {
  readonly name: string;

  init(app: DeviceInitOptions): Promise<void>;

  getStatus(req: UnisonHTRequest): Promise<DeviceStatus>;

  buttonPress(app: UnisonHT, button: string): Promise<boolean>;

  publicModulePath(app: UnisonHT): Promise<string>;

  powerOn?(app: UnisonHT): Promise<void>;

  powerOff?(app: UnisonHT): Promise<void>;
}

export function getDeviceUrlPrefix(device: Device): string {
  return `/device/${encodeURIComponent(device.name)}`;
}
