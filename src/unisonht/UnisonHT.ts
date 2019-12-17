import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Device } from './Device';
import { Method, Mode, RequestCallback, UnisonHTRequest } from './index';
import { InitOptions } from './InitOptions';
import { initializeRoutes } from './routes';
import { StaticFile } from './StaticFile';
import { readRequestParameters } from './httpUtils';

export interface UnionsHTOptionsHttp {
  port: number;
  hostname?: string;
}

export interface UnionsHTOptions {
  initialMode: string;
  http: UnionsHTOptionsHttp;
}

export class UnisonHT {
  private started: boolean = false;
  private _devices: Device[] = [];
  private _modes: Mode[] = [];
  private handlers: Handler[] = [];
  private _currentMode: Mode | null = null;

  async start(options: UnionsHTOptions): Promise<void> {
    await this.startHttpServer(options.http);
    await this.initializeDevices();
    await this.initializeModes();
    initializeRoutes(this);
    this.started = true;
    await this.switchToMode(options.initialMode);
  }

  private async startHttpServer(options: UnionsHTOptionsHttp) {
    return new Promise<void>((resolve, reject) => {
      http.createServer((req, res) => this.handleHttpServerRequest(req, res))
        .on('error', (err) => {
          reject(err);
        })
        .listen(options.port, options.hostname, () => {
          resolve();
        });
    });
  }

  private async handleHttpServerRequest(req: IncomingMessage, res: ServerResponse) {
    if (!req.url) {
      console.error(`Invalid request. Missing url`);
      res.writeHead(500);
      res.end();
    }
    if (!req.method) {
      console.error(`Invalid request. Missing url`);
      res.writeHead(500);
      res.end();
    }
    try {
      const url = new URL(`http://localhost${req.url || ''}`);
      const parameters = await readRequestParameters(req);
      const handlerReq: UnisonHTRequest = {
        method: req.method ? req.method as Method : Method.ERROR,
        url: req.url || '',
        path: url.pathname,
        parameters,
        app: this,
        http: req,
      };

      const result = await this.handle(handlerReq);
      if (!result) {
        res.writeHead(404);
        res.end();
      } else if (result instanceof StaticFile) {
        await result.send(res);
      } else if (typeof (result) === 'object') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(result));
        res.end();
      } else {
        console.error(`unhandled result type ${typeof result}`);
        res.writeHead(500);
        res.end();
      }
    } catch (err) {
      console.error(`Failed on url: ${req.method} ${req.url}`, err);
      res.writeHead(500);
      res.end();
    }
  }

  private async handle(req: UnisonHTRequest): Promise<any> {
    let error = undefined;
    for (const handler of this.handlers) {
      if ((error && handler.method === Method.ERROR)
        || (!error && handler.testUrl(req.path) && req.method === handler.method)) {
        try {
          let nextCalled = false;
          const result = await handler.handler(req, (err?) => {
            nextCalled = true;
            error = err;
          });
          if (nextCalled) {
            continue;
          }
          return result;
        } catch (err) {
          error = err;
        }
      }
    }

    if (error) {
      throw error;
    }
    return null;
  }

  private async initializeModes(): Promise<void> {
    for (const mode of this._modes) {
      const urlPrefix = `/mode/${mode.name}`;
      await mode.init(this.createInitOptions(urlPrefix));
      this.onPost(`${urlPrefix}/button`, async (req) => {
        const button = req.parameters['button'];
        if (!button) {
          throw new Error(`'button' is a required parameter`);
        }
        return await mode.buttonPress(this, button);
      });
    }
  }

  private async initializeDevices(): Promise<void> {
    for (const device of this._devices) {
      const urlPrefix = `/device/${device.name}`;
      await device.init(this.createInitOptions(urlPrefix));
      this.onGet(`${urlPrefix}`, async (req) => {
        const path = await device.publicModulePath(this);
        return new StaticFile(path);
      });
      this.onPost(`${urlPrefix}/button`, async (req) => {
        const button = req.parameters['button'];
        if (!button) {
          throw new Error(`'button' is a required parameter`);
        }
        return await device.buttonPress(this, button);
      });
      this.onGet(`${urlPrefix}/status`, async (req) => {
        return await device.getStatus(req);
      });
    }
  }

  private createInitOptions(urlPrefix: string): InitOptions {
    const unisonht = this;
    return {
      onGet(url: string, handler: RequestCallback): void {
        if (url.startsWith('/')) {
          unisonht.onGet(url, handler);
        } else {
          unisonht.onGet(`${urlPrefix}/${url}`, handler);
        }
      },
      onPost(url: string, handler: RequestCallback): void {
        if (url.startsWith('/')) {
          unisonht.onPost(url, handler);
        } else {
          unisonht.onPost(`${urlPrefix}/${url}`, handler);
        }
      },
      onPut(url: string, handler: RequestCallback): void {
        if (url.startsWith('/')) {
          unisonht.onPut(url, handler);
        } else {
          unisonht.onPut(`${urlPrefix}/${url}`, handler);
        }
      },
      onDelete(url: string, handler: RequestCallback): void {
        if (url.startsWith('/')) {
          unisonht.onDelete(url, handler);
        } else {
          unisonht.onDelete(`${urlPrefix}/${url}`, handler);
        }
      },
    };
  }

  addDevice(device: Device): UnisonHT {
    if (this.started) {
      throw new Error('Cannot add device after start is called');
    }
    this._devices.push(device);
    return this;
  }

  addMode(mode: Mode): UnisonHT {
    if (this.started) {
      throw new Error('Cannot add mode after start is called');
    }
    this._modes.push(mode);
    return this;
  }

  onGet(url: string | RegExp, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.GET, url, handler));
  }

  onPost(url: string | RegExp, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.POST, url, handler));
  }

  onPut(url: string | RegExp, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.PUT, url, handler));
  }

  onDelete(url: string | RegExp, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.DELETE, url, handler));
  }

  async switchToMode(mode: string): Promise<void> {
    const newMode = this.getMode(mode);
    if (!newMode) {
      throw new Error(`Invalid mode ${mode}`);
    }
    if (this._currentMode === newMode) {
      throw new Error(`Mode already set to ${mode}`);
    }
    let oldDevices: Device[] = [];
    if (this.currentMode) {
      oldDevices = this.currentMode.devices;
      if (this.currentMode.onExit) {
        await this.currentMode.onExit(this);
      }
    }
    this._currentMode = null;

    const newDevices = newMode.devices;
    const devicesToPowerOff: Device[] = oldDevices.filter(d => newDevices.indexOf(d) < 0);
    const devicesToPowerOn: Device[] = newDevices.filter(d => oldDevices.indexOf(d) < 0);

    for (const device of devicesToPowerOn) {
      if (device.powerOn) {
        await device.powerOn(this);
      }
    }
    for (const device of devicesToPowerOff) {
      if (device.powerOff) {
        await device.powerOff(this);
      }
    }

    if (newMode.onEnter) {
      await newMode.onEnter(this);
    }
    this._currentMode = newMode;
  }

  private getMode(mode: string): Mode | null {
    for (const m of this._modes) {
      if (m.name === mode) {
        return m;
      }
    }
    return null;
  }

  get modes(): Mode[] {
    return this._modes;
  }

  get devices(): Device[] {
    return this._devices;
  }

  get currentMode(): Mode | null {
    return this._currentMode;
  }
}

class Handler {
  private _method: Method;
  private _url: string | RegExp;
  private _handler: RequestCallback;

  constructor(method: Method, url: string | RegExp, handler: RequestCallback) {
    this._method = method;
    this._url = url;
    this._handler = handler;
  }

  testUrl(url: string) {
    if (typeof (this._url) === 'string') {
      return this._url === url;
    }
    return this._url.test(url);
  }

  get method(): Method {
    return this._method;
  }

  get url(): string | RegExp {
    return this._url;
  }

  get handler(): (req: UnisonHTRequest, next: (err?: Error) => void) => Promise<any> {
    return this._handler;
  }
}
