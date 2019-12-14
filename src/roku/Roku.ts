import { Device, DeviceInitOptions, DeviceStatus, UnisonHTRequest } from '../unisonht';

export class Roku implements Device {
  readonly name: string = 'roku';

  async init(app: DeviceInitOptions): Promise<void> {
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    return {};
  }
}
