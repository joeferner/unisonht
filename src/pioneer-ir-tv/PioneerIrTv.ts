import { Device, DeviceInitOptions, DeviceStatus, UnisonHT, UnisonHTRequest } from '../unisonht';

export class PioneerIrTv implements Device {
  readonly name: string = 'pioneer-tv';

  async init(app: DeviceInitOptions): Promise<void> {
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    return {};
  }

  async buttonPress(app: UnisonHT, button: string): Promise<void> {
    // TODO
  }
}