import * as express from "express";
import * as HttpStatusCodes from "http-status-codes";
import * as Boom from "boom";
import * as request from "request-promise";
import createLogger from "./Log";
import {Plugin} from "../";

const log = createLogger('UnisonHT');

export class UnisonHT {
  private app: express.Express;
  private plugins: Plugin[];
  private mode: string;
  private port: number;

  constructor() {
    this.app = express();
    this.plugins = [];
    this.mode = 'default';
  }

  listen(port: number): Promise<void> {
    this.port = port;
    this.app.use(this.currentModeRedirect.bind(this));

    return Promise.all(this.plugins.map((plugin) => {
      return plugin.start(this);
    })).then(() => {
      this.app.get('/devices', this.handleListDevices.bind(this));
      this.app.post('/mode', this.modeAction.bind(this));
      this.app.use(this.errorHandler.bind(this));

      return new Promise<void>((resolve) => {
        this.app.listen(port, () => {
          log.info(`listening http://localhost:${this.port}`);
          resolve();
        });
      });
    });
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

  protected modeAction(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const action = req.query.action;

    switch (action) {
      case 'change':
        return this.modeChange(req, res, next);
      default:
        return next(Boom.badRequest(`Invalid action: ${action}`));
    }
  }

  protected modeChange(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const newMode = req.query.mode;
    if (!newMode) {
      return next(Boom.badRequest('Missing "mode" query parameter'));
    }

    if (newMode === this.mode) {
      log.debug(`mode did not change ${newMode}`);
      res.status(HttpStatusCodes.NOT_MODIFIED).send();
      return;
    }

    log.debug(`changing mode ${newMode}`);
    this.exitCurrentMode()
      .then(() => {
        this.mode = null;
        return this.run(`/mode/${newMode}/enter`);
      })
      .then(() => {
        this.mode = newMode;
        log.debug(`mode changed ${newMode}`);
        res.status(HttpStatusCodes.NO_CONTENT).send();
      })
      .catch(next);
  }

  protected exitCurrentMode(): Promise<void> {
    if (!this.mode) {
      return Promise.resolve();
    }
    return this.run(`/mode/${this.mode}/exit`);
  }

  protected currentModeRedirect(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.url.startsWith('/mode/current/')) {
      const restOfUrl = req.url.substr('/mode/current/'.length);
      req.url = `/mode/${this.mode}/${restOfUrl}`;
    }
    next();
  }

  use(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  run(url: string): Promise<any> {
    return request(`http://localhost:${this.port}${url}`);
  }

  protected errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
    log.error(err);
    if ((<Boom.BoomError>err).isBoom) {
      const boomError: Boom.BoomError = <Boom.BoomError> err;
      res.status(boomError.output.statusCode).json(boomError.output.payload);
    } else {
      res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  getApp(): express.Express {
    return this.app;
  }

  static urlDeviceButtonPress(deviceName: string, buttonName: string): string {
    return `/device/${deviceName}/button-press?button=${encodeURIComponent(buttonName)}`;
  }
}
