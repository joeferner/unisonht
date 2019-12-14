import { Device, DeviceInitOptions, DeviceStatus, UnisonHTRequest } from '../unisonht';

export class PioneerIrTv implements Device {
  readonly name: string = 'pioneer-tv';

  async init(app: DeviceInitOptions): Promise<void> {
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    return {};
  }
}