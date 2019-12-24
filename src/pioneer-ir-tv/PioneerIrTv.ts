import { Device, DeviceInitOptions, DeviceStatus, UnisonHT, UnisonHTRequest } from '../unisonht';
import * as path from 'path';

export class PioneerIrTv implements Device {
  private _name: string;
  private _app: UnisonHT | undefined;

  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  async init(options: DeviceInitOptions): Promise<void> {
    this._app = options.app;
  }

  async publicModulePath(app: UnisonHT): Promise<string> {
    return path.join(__dirname, '../../src/roku/public/PioneerTv.jsx');
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    return {};
  }

  async powerOff(app: UnisonHT): Promise<void> {
    const result = await app.lircClient.sendOnce('pioneertv', 'POWER_OFF');
    console.log(result);
  }

  async powerOn(app: UnisonHT): Promise<void> {
    const result = await app.lircClient.sendOnce('pioneertv', 'POWER_ON');
    console.log(result);
  }

  async buttonPress(app: UnisonHT, button: string): Promise<boolean> {
    const result = await app.lircClient.sendOnce('pioneertv', button);
    console.log(result);
    return false;
  }

  async setInput(input: PioneerIrTvInput): Promise<void> {
    if (!this._app) {
      throw new Error('not initialized');
    }
    const result = await this._app.lircClient.sendOnce('pioneertv', input);
    console.log(result);
  }
}

export enum PioneerIrTvInput {
  PC = 'PC',
  ANT = 'ANT',
  AV1 = 'AV1',
  AV2 = 'AV2',
  AV3 = 'AV3',
  AV4 = 'AV4',
  HDMI5 = 'HDMI5',
  HDMI6 = 'HDMI6'
}