import http, {IncomingMessage, Server, ServerResponse} from 'http';
import {UnisonHTPlugin} from "./UnisonHTPlugin";
import {DevicesListPlugin} from "./plugins/DevicesListPlugin";
import pathToRegexp from "path-to-regexp";
import {instanceOfUnisonHTDevice, UnisonHTDevice} from "./UnisonHTDevice";
import {RouteHandlerRequest} from "./RouteHandlerRequest";
import {Method} from "./Method";
import Debug from 'debug';
import {RouteHandlerResponse} from "./RouteHandlerResponse";

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

export type NextFunction = (err?: Error) => void;

export type RouteHandler = (
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction
) => Promise<void>;

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

    private async handleKeyPress(
        plugin: UnisonHTPlugin,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction
    ): Promise<void> {
        const key = request.parameters['key'];
        if (!key) {
            throw Error(`Missing 'key' parameter`);
        }
        debug(`handleKeyPress(key=${key})`);
        const newNext = async (err?: Error) => {
            if (err) {
                next(err);
                return;
            }
            try {
                if (instanceOfUnisonHTDevice(plugin)) {
                    let req = {
                        ...request,
                        url: `/mode/current/key/${key}`
                    };
                    await this.internalExecute(req, response, next);
                } else {
                    next();
                }
            } catch (err) {
                next(err);
            }
        };
        await plugin.handleKeyPress(key, request, response, newNext);
    }

    private async handleDeviceStatus(
        device: UnisonHTDevice,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse
    ): Promise<void> {
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
        await response.send({
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
                parameters: {}
            };
            const response: RouteHandlerResponse = {
                send: (result?: any) => {
                    resolve(result);
                }
            };
            const next = (err?: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                reject(new Error(`url not found: ${request.url}`));
            };
            this.internalExecute(request, response, next)
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async internalExecute(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction
    ): Promise<void> {
        debug(`internalExecute(url=${request.url})`);
        const parsedUrl = new URL(request.url, 'http://unisonht.com');
        const run = async (i: number) => {
            const handler = this.handlers[i];
            if (!handler) {
                next();
                return;
            }
            if (handler.method !== request.method) {
                run(i + 1);
                return;
            }
            const m = handler.regex.exec(parsedUrl.pathname);
            if (!m) {
                run(i + 1);
                return;
            }

            const req: RouteHandlerRequest = {
                ...request,
                parameters: {}
            };
            for (let i = 0; i < handler.keys.length; i++) {
                const key = handler.keys[i];
                req.parameters[key.name] = m[i + 1];
            }
            parsedUrl.searchParams.forEach((value, key) => {
                req.parameters[key] = value;
            });

            const res: RouteHandlerResponse = {
                ...response
            };

            const n: NextFunction = (err?: Error) => {
                if (err) {
                    next(err);
                    return;
                }
                run(i + 1);
            };

            try {
                await handler.options.handler(req, res, n);
            } catch (err) {
                next(err);
            }
        };
        run(0);
    }

    private async handleHttpRequest(
        req: IncomingMessage,
        res: ServerResponse
    ) {
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
            httpRequest: req
        };
        const response: RouteHandlerResponse = {
            httpResponse: res,
            send: (result?: any) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(result ? JSON.stringify(result) : undefined);
            }
        };
        const next: NextFunction = (err?: Error) => {
            if (err) {
                console.error(`failed to handle request: ${req.url}`, err);
                res.statusCode = 500;
                res.end();
                return;
            }
            res.statusCode = 404;
            res.end();
        };
        try {
            await this.internalExecute(request, response, next);
        } catch (err) {
            console.error(`failed to handle request: ${req.url}`, err);
            res.statusCode = 500;
            res.end();
        }
    }
}
