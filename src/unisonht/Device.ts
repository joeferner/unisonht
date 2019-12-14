import { DeviceInitOptions } from './DeviceInitOptions';
import { UnisonHTRequest } from './UnisonHTRequest';
import { DeviceStatus } from './DeviceStatus';

export interface Device {
  readonly name: string;

  init(app: DeviceInitOptions): Promise<void>;

  getStatus(req: UnisonHTRequest): Promise<DeviceStatus>;
}
