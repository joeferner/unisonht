import * as express from "express";
import * as Logger from "bunyan";
import {Plugin} from "./Plugin";
import {UnisonHT} from "./UnisonHT";
import createLogger from "./Log";

export abstract class Device extends Plugin {
  private deviceName: string;
  protected log: Logger;

  constructor(deviceName: string) {
    super(`/device/${deviceName}`);
    this.log = createLogger(`UnisonHT.Device[${deviceName}]`);
    this.deviceName = deviceName;
  }

  start(unisonht: UnisonHT): Promise<void> {
    return super.start(unisonht)
      .then(() => {
        unisonht.getApp().get(`${this.getPathPrefix()}`, this.handleGetStatus.bind(this));
        unisonht.getApp().post(`${this.getPathPrefix()}/button-press`, this.handleButtonPress.bind(this));
      });
  }

  protected handleGetStatus(req: express.Request, res: express.Response, next: express.NextFunction): void {
    this.getStatus()
      .then((status) => {
        res.json(status);
      })
      .catch(next);
  }

  abstract getStatus(): Promise<Device.Status>;

  public getDeviceName(): string {
    return this.deviceName;
  }

  protected abstract handleButtonPress(req: express.Request, res: express.Response, next: express.NextFunction): void;
}

export module Device {
  export interface Status {
    power?: PowerState;
  }

  export enum PowerState {
    ON,
    OFF
  }
}