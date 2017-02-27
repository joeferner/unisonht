import * as express from "express";
import * as HttpStatusCodes from "http-status-codes";
import * as Boom from "boom";
import * as Logger from "bunyan";
import {UnisonHTResponse} from "./UnisonHTResponse";
import {createLogger} from "./Log";
import {Plugin} from "../";
import * as sourceMapSupport from "source-map-support";
sourceMapSupport.install();

export class UnisonHT {
  private app: express.Express;
  private plugins: Plugin[];
  private mode: string;
  private port: number;
  protected log: Logger;

  constructor() {
    this.log = createLogger(`UnisonHT`);
    this.app = express();
    this.plugins = [];
    this.mode = null;
  }

  listen(port: number): Promise<void> {
    this.port = port;
    this.app.use(this.logRequest.bind(this));
    this.app.use(this.expressResponseHelpers.bind(this));
    this.app.use(this.currentModeRedirect.bind(this));
    this.app.get('/devices', this.handleListDevices.bind(this));
    this.app.get('/inputs', this.handleListInputs.bind(this));
    this.app.get('/modes', this.handleListModes.bind(this));
    this.app.post('/mode', this.modeAction.bind(this));

    return Promise.all(this.plugins.map((plugin) => {
      return plugin.start(this)
        .catch((err) => {
          this.log.error(`failed to start plugin: ${plugin.toString()}:`, err);
          throw err;
        });
    })).then(() => {
      this.app.use(this.unhandledRequest.bind(this));
      this.app.use(this.errorHandler.bind(this));

      return new Promise<void>((resolve) => {
        this.app.listen(port, () => {
          this.log.info(`listening http://localhost:${this.port}`);
          resolve();
        });
      });
    });
  }

  private logRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
    this.log.debug(req.url);
    next();
  }

  private unhandledRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
    next(Boom.notFound());
  }

  private expressResponseHelpers(req: express.Request, res: express.Response, next: express.NextFunction): void {
    (<UnisonHTResponse>res).deviceButtonPress = (deviceName: string, buttonName: string): void => {
      req.url = `/device/${deviceName}/button-press?button=${encodeURIComponent(buttonName)}`;
      this.app._router.handle(req, res, (err) => {
        if (err) {
          next(err);
        }
      });
    };

    (<UnisonHTResponse>res).changeMode = (newMode: string): void => {
      this.modeChange(newMode, res, next);
    };

    (<UnisonHTResponse>res).promiseNoContent = function (promise: Promise<any>) {
      promise
        .then(() => {
          res.status(HttpStatusCodes.NO_CONTENT).send();
        })
        .catch(next);
    };

    next();
  }

  private handleListDevices(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const devices = new Set();
    this.app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        const m = r.route.path.match(/\/device\/(.*?)\//);
        if (m) {
          devices.add(m[1]);
        }
      }
    });
    res.json(Array.from(devices));
  }

  private handleListInputs(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const inputs = new Set();
    this.app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        const m = r.route.path.match(/\/input\/(.*?)\//);
        if (m) {
          inputs.add(m[1]);
        }
      }
    });
    res.json(Array.from(inputs));
  }

  private handleListModes(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const modes = new Set();
    this.app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        const m = r.route.path.match(/\/mode\/(.*?)\//);
        if (m) {
          modes.add(m[1]);
        }
      }
    });
    res.json(Array.from(modes));
  }

  protected modeAction(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const action = req.query.action;

    switch (action) {
      case 'change':
        const newMode = req.query.mode;
        return this.modeChange(newMode, res, next);
      default:
        return next(Boom.badRequest(`Invalid action: ${action}`));
    }
  }

  protected modeChange(newMode: string, res: express.Response, next: express.NextFunction): void {
    if (!newMode) {
      return next(Boom.badRequest('Missing "mode" query parameter'));
    }

    if (newMode === this.mode) {
      this.log.debug(`mode did not change ${newMode}`);
      res.json({
        mode: this.mode
      });
      return;
    }

    this.log.debug(`changing mode ${newMode}`);
    this.exitCurrentMode()
      .then(() => {
        this.mode = null;
        return this.execute(`/mode/${newMode}/enter`);
      })
      .then(() => {
        this.mode = newMode;
        this.log.debug(`mode changed ${newMode}`);
        res.json({
          mode: this.mode
        });
      })
      .catch(next);
  }

  protected exitCurrentMode(): Promise<void> {
    if (!this.mode) {
      return Promise.resolve();
    }
    return this.execute(`/mode/${this.mode}/exit`);
  }

  protected currentModeRedirect(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.url.startsWith('/mode/current/') && this.mode) {
      this.log.debug(`redirecting to current mode "${this.mode}"`);
      const restOfUrl = req.url.substr('/mode/current/'.length);
      req.url = `/mode/${this.mode}/${restOfUrl}`;
    }
    next();
  }

  use(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  currentModeButtonPress(buttonName: string): Promise<void> {
    return this.modeButtonPress('current', buttonName);
  }

  modeButtonPress(mode: string, buttonName: string): Promise<void> {
    return this.execute(`/mode/${mode}/button-press?button=${encodeURIComponent(buttonName)}`);
  }

  execute(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = {
        method: 'POST',
        url: url
      };
      const res = {
        statusCode: 200,
        headers: {},
        content: new Buffer(''),
        sendStatus: (status) => {
          console.log('sendStatus', status);
        },
        setHeader: (name, value) => {
          res.headers[name] = value;
        },
        removeHeader: (name) => {
          delete res.headers[name];
        },
        end: (chunk, encoding) => {
          if (chunk) {
            res.content = Buffer.concat([res.content, chunk]);
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`bad response: ${res.statusCode}`));
          }
        }
      };
      this.app._router.handle(req, res, (err) => {
        console.log('done', err);
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  protected errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!err) {
      next();
      return;
    }
    if ((<Boom.BoomError>err).isBoom) {
      const boomError: Boom.BoomError = <Boom.BoomError> err;
      if (boomError.output.statusCode == HttpStatusCodes.NOT_FOUND) {
        this.log.warn(`not found ${req.url}`);
      } else {
        this.log.error(err);
      }
      res.status(boomError.output.statusCode).json(boomError.output.payload);
    } else {
      this.log.error(err);
      res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  getApp(): express.Express {
    return this.app;
  }
}
