import http, {IncomingMessage, Server, ServerResponse} from 'http';
import {UnisonHTPlugin} from "./UnisonHTPlugin";
import {DevicesListPlugin} from "./plugins/DevicesListPlugin";
import pathToRegexp from "path-to-regexp";
import {instanceOfUnisonHTDevice, UnisonHTDevice} from "./UnisonHTDevice";
import {RouteHandlerRequest} from "./RouteHandlerRequest";
import {Method} from "./Method";
import Debug from 'debug';

const debug = Debug('UnisonHT');

export interface UnisonHTOptions {
    defaultMode?: string;
}

interface InternalRouterHandler {
    plugin: UnisonHTPlugin;
    method: Method;
    path: string;
    keys: pathToRegexp.Key[];
    regex: RegExp;
    options: RouteOptions;
}

type RouteHandler = (request: RouteHandlerRequest) => Promise<void>;

export interface RouteOptions {
    handler: RouteHandler;
}

const DEFAULT_OPTIONS: UnisonHTOptions = {};

export class UnisonHT {
    private server: Server;
    private options: UnisonHTOptions;
    private plugins: UnisonHTPlugin[] = [];
    private handlers: InternalRouterHandler[] = [];

    constructor(options: UnisonHTOptions) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        };
        this.server = http.createServer((req, res) => {
            this.handleHttpRequest(req, res);
        });
        this.use(new DevicesListPlugin());
    }

    use(plugin: UnisonHTPlugin): void {
        this.plugins.push(plugin);
    }

    getDevices(): UnisonHTDevice[] {
        return this.plugins
            .filter((plugin) => instanceOfUnisonHTDevice(plugin))
            .map((plugin) => plugin as UnisonHTDevice);
    }

    get(plugin: UnisonHTPlugin, path: string, options: RouteOptions): void {
        this.method(Method.GET, plugin, path, options);
    }

    post(plugin: UnisonHTPlugin, path: string, options: RouteOptions): void {
        this.method(Method.POST, plugin, path, options);
    }

    private method(method: Method, plugin: UnisonHTPlugin, path: string, options: RouteOptions): void {
        if (!path.startsWith('/')) {
            if (instanceOfUnisonHTDevice(plugin)) {
                path = this.getDeviceUrlPrefix(plugin) + '/' + path;
            } else {
                throw new Error(`Unhandled plugin type: ${plugin.constructor.name}`);
            }
        }
        const keys: pathToRegexp.Key[] = [];
        const regex = pathToRegexp(path, keys);
        this.handlers.push({
            plugin,
            method,
            path,
            keys,
            regex,
            options
        });
    }

    async listen(port: number): Promise<void> {
        await this.initializePlugins();
        return new Promise((resolve, reject) => {
            this.server.listen(port, () => {
                resolve();
            })
        });
    }

    private async initializePlugins(): Promise<void> {
        for (const plugin of this.plugins) {
            if (plugin.initialize) {
                await plugin.initialize(this);
                if (instanceOfUnisonHTDevice(plugin)) {
                    const device = plugin as UnisonHTDevice;
                    this.get(plugin, `/device/${device.getDeviceName()}`, {
                        handler: this.handleDeviceStatus.bind(this, device)
                    });
                    this.post(plugin, `/device/${device.getDeviceName()}/key/:key`, {
                        handler: this.handleKeyPress.bind(this, device)
                    });
                }
            }
        }
    }

    private async handleKeyPress(plugin: UnisonHTPlugin, request: RouteHandlerRequest): Promise<void> {
        const key = request.parameters['key'];
        if (!key) {
            throw Error(`Missing 'key' parameter`);
        }
        debug(`handleKeyPress(key=${key})`);
        const originalNext = request.next;
        request.next = async (request: RouteHandlerRequest) => {
            try {
                if (instanceOfUnisonHTDevice(plugin)) {
                    await this.internalExecute({
                        ...request,
                        url: `/mode/current/key/${key}`
                    });
                } else {
                    originalNext(request);
                }
            } catch (err) {
                request.error(err);
            }
        };
        await plugin.handleKeyPress(key, request);
    }

    private async handleDeviceStatus(device: UnisonHTDevice, request: RouteHandlerRequest): Promise<void> {
        let status;
        try {
            status = await device.getStatus();
        } catch (err) {
            console.error(`Could not get device "${device.getDeviceName()}" status`, err);
            status = {
                error: err.message
            };
        }
        const handlers = this.handlers
            .filter(handler => handler.plugin === device)
            .map(handler => {
                return {
                    method: handler.method,
                    path: handler.path
                };
            });
        await request.resolve({
            type: device.constructor.name,
            handlers,
            ...status
        });
    }

    getDeviceUrlPrefix(device: UnisonHTDevice): string {
        return `/device/${device.getDeviceName()}`;
    }

    async executeGet(url: string): Promise<any> {
        return this.execute(Method.GET, url);
    }

    async executePost(url: string): Promise<any> {
        return this.execute(Method.POST, url);
    }

    private async execute(method: Method, url: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const request: RouteHandlerRequest = {
                method,
                url,
                unisonht: this,
                parameters: {},
                next: (request: RouteHandlerRequest) => {
                    reject(new Error(`url not found: ${request.url}`));
                },
                resolve: (result: any) => {
                    resolve(result);
                },
                error: (err: Error) => {
                    reject(err);
                }
            };
            this.internalExecute(request)
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async internalExecute(request: RouteHandlerRequest): Promise<void> {
        debug(`internalExecute(url=${request.url})`);
        const originalNext = request.next;
        request.next = (request: RouteHandlerRequest) => {
            throw new Error('fail');
        };
        const parsedUrl = new URL(request.url, 'http://unisonht.com');
        for (const handler of this.handlers) {
            if (handler.method !== request.method) {
                continue;
            }
            const m = handler.regex.exec(parsedUrl.pathname);
            if (m) {
                request.parameters = {};
                for (let i = 0; i < handler.keys.length; i++) {
                    const key = handler.keys[i];
                    request.parameters[key.name] = m[i + 1];
                }
                parsedUrl.searchParams.forEach((value, key) => {
                    request.parameters[key] = value;
                });
                try {
                    await handler.options.handler(request);
                } catch (err) {
                    request.error(err);
                }
                return;
            }
        }
        try {
            request.next(request);
        } catch (err) {
            request.error(err);
        }
    }

    private async handleHttpRequest(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            res.statusCode = 400;
            res.end();
            return;
        }
        const request: RouteHandlerRequest = {
            unisonht: this,
            url: req.url,
            parameters: {},
            method: req.method as Method,
            httpRequest: req,
            httpResponse: res,
            error: (err: Error) => {
                console.error(`failed to handle request: ${req.url}`, err);
                res.statusCode = 500;
                res.end();
            },
            resolve: (result: any) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            },
            next: (request: RouteHandlerRequest) => {
                res.statusCode = 404;
                res.end();
            }
        };
        try {
            await this.internalExecute(request);
        } catch (err) {
            console.error(`failed to handle request: ${req.url}`, err);
            res.statusCode = 500;
            res.end();
        }
    }
}
