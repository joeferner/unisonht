import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Device } from './Device';
import { ButtonPressRequestCallback, RequestCallback, UnisonHTRequest, UnisonHTResponse } from './index';

export interface UnionsHTOptionsHttp {
  port: number;
  hostname?: string;
}

export interface UnionsHTOptions {
  http: UnionsHTOptionsHttp;
}

export class UnisonHT {
  private started: boolean = false;
  private devices: Device[] = [];
  private handlers: Handler[] = [];

  async start(options: UnionsHTOptions): Promise<void> {
    await this.startHttpServer(options.http);
    await this.initializeDevices();
    await this.initializeDefaultRoutes();
    this.started = true;
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
    let error = undefined;
    for (const handler of this.handlers) {
      if ((error && handler.method === Method.ERROR)
        || (!error && req.url === handler.url && req.method === handler.method)) {
        try {
          let nextCalled = false;
          const result = await handler.handler(req, res, (err?) => {
            nextCalled = true;
            error = err;
          });
          if (nextCalled) {
            continue;
          }
          if (result) {
            if (typeof (result) === 'object') {
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
            return;
          }
        } catch (err) {
          error = err;
        }
      }
    }

    if (error) {
      console.error(`Failed on url: ${req.method} ${req.url}`, error);
      res.writeHead(500);
      res.end();
    } else {
      res.writeHead(404);
      res.end();
    }
  }

  private async initializeDefaultRoutes(): Promise<void> {
    this.onGet('/device', (req, res) => this.handleDeviceList(req, res));
  }

  private async initializeDevices(): Promise<void> {
    const unisonht = this;
    for (const device of this.devices) {
      const deviceUrlPrefix = `/device/${device.name}`;
      await device.init({
        onGet(url: string, handler: RequestCallback): void {
          if (url.startsWith('/')) {
            unisonht.onGet(url, handler);
          } else {
            unisonht.onGet(`${deviceUrlPrefix}/${url}`, handler);
          }
        },
        onPost(url: string, handler: RequestCallback): void {
          if (url.startsWith('/')) {
            unisonht.onPost(url, handler);
          } else {
            unisonht.onPost(`${deviceUrlPrefix}/${url}`, handler);
          }
        },
        onPut(url: string, handler: RequestCallback): void {
          if (url.startsWith('/')) {
            unisonht.onPut(url, handler);
          } else {
            unisonht.onPut(`${deviceUrlPrefix}/${url}`, handler);
          }
        },
        onDelete(url: string, handler: RequestCallback): void {
          if (url.startsWith('/')) {
            unisonht.onDelete(url, handler);
          } else {
            unisonht.onDelete(`${deviceUrlPrefix}/${url}`, handler);
          }
        },
        onButtonPress(url: string, handler: ButtonPressRequestCallback): void {
          unisonht.onPost(`${deviceUrlPrefix}/button`, handler);
        },
      });
      this.onGet(`${deviceUrlPrefix}/status`, async (req, res) => {
        return await device.getStatus(req);
      });
    }
  }

  addDevice(device: Device): UnisonHT {
    if (this.started) {
      throw new Error('Cannot add device after start is called');
    }
    this.devices.push(device);
    return this;
  }

  onGet(url: string, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.GET, url, handler));
  }

  onPost(url: string, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.POST, url, handler));
  }

  onPut(url: string, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.PUT, url, handler));
  }

  onDelete(url: string, handler: RequestCallback): void {
    this.handlers.push(new Handler(Method.DELETE, url, handler));
  }

  private async handleDeviceList(req: UnisonHTRequest, res: UnisonHTResponse): Promise<DeviceListResponse> {
    return {
      deviceNames: this.devices.map(device => device.name),
    };
  }
}

interface DeviceListResponse {
  deviceNames: string[];
}

enum Method {
  ERROR = 'ERROR',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

class Handler {
  method: Method;
  url: string;
  handler: RequestCallback;

  constructor(method: Method, url: string, handler: RequestCallback) {
    this.method = method;
    this.url = url;
    this.handler = handler;
  }
}
