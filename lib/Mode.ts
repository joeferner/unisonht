import * as express from "express";
import * as HttpStatusCodes from "http-status-codes";
import * as Logger from "bunyan";
import * as Boom from "boom";
import {Plugin} from "./Plugin";
import {UnisonHT} from "./UnisonHT";
import createLogger from "./Log";

export interface ButtonMapHandler {
  (req: express.Request, res: express.Response, next: express.NextFunction): any;
}

export class Mode extends Plugin {
  private modeName: string;
  private options: Mode.Options;
  protected log: Logger;

  constructor(modeName: string, options: Mode.Options) {
    super(`/mode/${modeName}`);
    this.log = createLogger(`UnisonHT.Mode[${modeName}]`);
    this.modeName = modeName;
    this.options = options;
    this.options.buttonMap = this.options.buttonMap || {};
    if (!('nextOnNotFound' in this.options)) {
      this.options.nextOnNotFound = true;
    }
  }

  start(unisonht: UnisonHT): Promise<void> {
    return super.start(unisonht)
      .then(() => {
        unisonht.getApp().post(`${this.getPathPrefix()}/button-press`, this.handleButtonPress.bind(this));
        if (this.canEnter()) {
          unisonht.getApp().post(`${this.getPathPrefix()}/enter`, this.enterHandler.bind(this));
          unisonht.getApp().post(`${this.getPathPrefix()}/exit`, this.exitHandler.bind(this));
        }
      });
  }

  private enterHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    this.enter()
      .then(() => {
        res.status(HttpStatusCodes.NO_CONTENT).send();
      })
      .catch(next);
  }

  private exitHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    this.exit()
      .then(() => {
        res.status(HttpStatusCodes.NO_CONTENT).send();
      })
      .catch(next);
  }

  protected canEnter(): boolean {
    return true;
  }

  enter(): Promise<void> {
    this.log.debug(`enter ${this.modeName}`);
    return Promise.resolve();
  }

  exit(): Promise<void> {
    this.log.debug(`exit ${this.modeName}`);
    return Promise.resolve();
  }

  protected handleButtonPress(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const buttonName = req.query.button;
    const button = this.options.buttonMap[buttonName];
    if (button) {
      button(req, res, next);
      return;
    }

    const deviceName = this.options.defaultDevice;
    if (deviceName) {
      this.log.debug(`forwarding button press "${buttonName}" to device "${deviceName}"`);
      return res.redirect(UnisonHT.urlDeviceButtonPress(deviceName, buttonName));
    }

    if (this.options.nextOnNotFound) {
      next();
      return;
    }
    next(Boom.badRequest(`Invalid button ${buttonName}`));
  }

  protected getOptions(): Mode.Options {
    return this.options;
  }
}

export module Mode {
  export interface Options {
    defaultDevice?: string;
    buttonMap?: {[key: string]: ButtonMapHandler};
    nextOnNotFound?: boolean;
  }
}
