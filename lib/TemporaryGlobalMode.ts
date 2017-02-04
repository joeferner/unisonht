import * as express from "express";
import * as HttpStatusCodes from "http-status-codes";
import {GlobalMode} from "./GlobalMode";
import {Mode} from "./Mode";

enum State {
  ON,
  OFF
}

export class TemporaryGlobalMode extends GlobalMode {
  private state: State;
  private timeout: any;

  constructor(options: TemporaryGlobalMode.Options) {
    super(options);
    options.timeout = options.timeout || 5000;
    this.state = State.OFF;
  }

  handleButtonPress(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const buttonName = req.query.button;
    switch (this.state) {
      case State.OFF:
        if (buttonName === this.getOptions().activateButton) {
          this.enterTemporary()
            .then(() => {
              this.log.debug('TemporaryGlobalMode on');
              this.state = State.ON;
              this.refreshTimeout();
              res.status(HttpStatusCodes.NO_CONTENT).send();
            })
            .catch(next);
        } else {
          next();
        }
        break;
      case State.ON:
        if (buttonName === this.getOptions().activateButton) {
          this.handleTimeout();
          next();
        } else {
          this.refreshTimeout();
          super.handleButtonPress(req, res, next);
        }
        break;
      default:
        next(new Error(`Invalid TemporaryGlobalMode state: ${this.state}`));
        break;
    }
  }

  protected enterTemporary(): Promise<void> {
    return Promise.resolve();
  }

  protected exitTemporary(): void {

  }

  private refreshTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.handleTimeout.bind(this), this.getOptions().timeout);
  }

  handleTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = null;
    this.state = State.OFF;
    this.exitTemporary();
    this.log.debug('TemporaryGlobalMode off');
  }

  protected getOptions(): TemporaryGlobalMode.Options {
    return <TemporaryGlobalMode.Options>super.getOptions();
  }
}

export module TemporaryGlobalMode {
  export interface Options extends Mode.Options {
    timeout?: number;
    activateButton: string;
  }
}
