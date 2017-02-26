import * as express from "express";
import * as Logger from "bunyan";
import {Plugin} from "./Plugin";
import {UnisonHT} from "./UnisonHT";
import {createLogger} from "./Log";

export abstract class Device extends Plugin {
  private deviceName: string;
  private options: Device.Options;
  protected log: Logger;

  constructor(deviceName: string, options: Device.Options) {
    super(`/device/${deviceName}`);
    this.options = options;
    this.log = createLogger(`UnisonHT.Device[${deviceName}]`);
    this.deviceName = deviceName;
  }

  start(unisonht: UnisonHT): Promise<void> {
    return super.start(unisonht)
      .then(() => {
        unisonht.getApp().post(`${this.getPathPrefix()}/button-press`, this.handleButtonPress.bind(this));
      });
  }

  getStatus(): Promise<Device.Status> {
    return Promise.resolve({});
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public getOptions(): Device.Options {
    return this.options;
  }

  protected abstract handleButtonPress(req: express.Request, res: express.Response, next: express.NextFunction): void;
}

export module Device {
  export interface Options {

  }

  export interface Status {
    power?: PowerState;
  }

  export enum PowerState {
    OFF = 0,
    ON = 1
  }
}