import { Device, DeviceInitOptions, DeviceStatus, UnisonHT, UnisonHTRequest } from '../unisonht';

export class DenonRs232Avr implements Device {
  readonly name: string = 'denon-avr';

  async init(app: DeviceInitOptions): Promise<void> {
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    return {};
  }

  async buttonPress(app: UnisonHT, button: string): Promise<void> {
    // TODO
  }
}