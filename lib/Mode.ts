import * as express from "express";
import * as Logger from "bunyan";
import * as Boom from "boom";
import {Plugin} from "./Plugin";
import {UnisonHT} from "./UnisonHT";
import {UnisonHTResponse} from "./UnisonHTResponse";
import {createLogger} from "./Log";

export interface ButtonMapHandler {
  (req: express.Request, res: UnisonHTResponse, next: express.NextFunction): any;
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
    (<UnisonHTResponse>res).promiseNoContent(this.enter());
  }

  private exitHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    (<UnisonHTResponse>res).promiseNoContent(this.exit());
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
    let buttonName = this.resolveButtonName(req.query.button);
    this.log.debug(`handleButtonPress: ${buttonName}`);
    const button = this.options.buttonMap[buttonName];
    if (button) {
      (<ButtonMapHandler>button)(req, <UnisonHTResponse>res, next);
      return;
    }

    const deviceName = this.options.defaultDevice;
    if (deviceName) {
      this.log.debug(`forwarding button press "${buttonName}" to device "${deviceName}"`);
      (<UnisonHTResponse>res).deviceButtonPress(deviceName, buttonName);
      return;
    }

    if (this.options.nextOnNotFound) {
      next();
      return;
    }
    next(Boom.badRequest(`Invalid button ${buttonName}`));
  }

  protected resolveButtonName(buttonName: string): string {
    if (typeof this.options.buttonMap[buttonName] === 'string') {
      return <string>this.options.buttonMap[buttonName];
    }
    return buttonName;
  }

  protected getOptions(): Mode.Options {
    return this.options;
  }
}

export module Mode {
  export interface Options {
    defaultDevice?: string;
    buttonMap?: {[key: string]: ButtonMapHandler|string};
    nextOnNotFound?: boolean;
  }
}