import { Device, DeviceInitOptions, DeviceStatus, UnisonHT, UnisonHTRequest } from '../unisonht';
import * as path from 'path';

export class Roku implements Device {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  async init(app: DeviceInitOptions): Promise<void> {
  }

  async publicModulePath(app: UnisonHT): Promise<string> {
    return path.join(__dirname, '../../src/roku/public/Roku.jsx');
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    return {};
  }

  async buttonPress(app: UnisonHT, button: string): Promise<void> {
    // TODO
  }
}
