import { UnisonHTPlugin } from './UnisonHTPlugin';
import { DevicesList } from './plugins/DevicesList';
import { Key as PathToRegexpKey, pathToRegexp } from 'path-to-regexp';
import { instanceOfUnisonHTDevice, UnisonHTDevice } from './UnisonHTDevice';
import { RouteHandlerRequest } from './RouteHandlerRequest';
import { Method } from './Method';
import Debug from 'debug';
import { RouteHandlerResponse } from './RouteHandlerResponse';
import { CurrentMode } from './plugins/CurrentMode';
import { instanceOfUnisonHTMode, UnisonHTMode } from './UnisonHTMode';
import { DefaultButtonHandler } from './plugins/DefaultButtonHandler';
import { NotFoundError } from './NotFoundError';
import { URL } from 'url';
import fs from 'fs';

const debug = Debug('UnisonHT');

export interface UnisonHTOptions {
    defaultMode?: string;
    settingsFileName?: string;
}

interface InternalRouterHandler {
    plugin: UnisonHTPlugin;
    method: Method;
    path: string;
    keys: PathToRegexpKey[];
    regex: RegExp;
    options: RouteOptions;
}

export interface DeviceStatusResponseHandler {
    method: Method;
    path: string;
}

export interface DeviceStatusResponseButtons {
    [button: string]: {
        name: string;
        description?: string;
    };
}

export interface DeviceStatusResponse {
    type: string;
    handlers: DeviceStatusResponseHandler[];
    buttons: DeviceStatusResponseButtons;

    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type NextFunction = (err?: Error) => void;

export type ButtonHandler = (
    button: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
) => Promise<void>;

export type RouteHandler = (
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
) => Promise<void>;

export interface RouteOptions {
    handler: RouteHandler;
}

const DEFAULT_OPTIONS: UnisonHTOptions = {};

export class UnisonHT {
    private options: UnisonHTOptions;
    private plugins: UnisonHTPlugin[] = [];
    private handlers: InternalRouterHandler[] = [];
    private currentMode: string | undefined;

    constructor(options: UnisonHTOptions) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
        this.currentMode = this.options.defaultMode;
        this.use(new DefaultButtonHandler());
        this.use(new CurrentMode());
        this.use(new DevicesList());
    }

    public async start(): Promise<void> {
        await this.initializePlugins();
    }

    public use(plugin: UnisonHTPlugin): void {
        this.plugins.push(plugin);
    }

    public getCurrentMode(): UnisonHTMode | undefined {
        if (!this.currentMode) {
            return undefined;
        }
        return this.getMode(this.currentMode);
    }

    public getDevices(): UnisonHTDevice[] {
        return this.plugins
            .filter((plugin) => instanceOfUnisonHTDevice(plugin))
            .map((plugin) => plugin as UnisonHTDevice);
    }

    public getModes(): UnisonHTMode[] {
        return this.plugins.filter((plugin) => instanceOfUnisonHTMode(plugin)).map((plugin) => plugin as UnisonHTMode);
    }

    public getMode(modeName: string): UnisonHTMode | undefined {
        const matches = this.getModes().filter((mode) => mode.getModeName() === modeName);
        if (matches.length === 0) {
            return undefined;
        }
        if (matches.length === 1) {
            return matches[0];
        }
        throw new Error(`Expected 0 or 1 matches found ${matches.length}`);
    }

    public get(plugin: UnisonHTPlugin, path: string, options: RouteOptions): void {
        this.method(Method.GET, plugin, path, options);
    }

    public post(plugin: UnisonHTPlugin, path: string, options: RouteOptions): void {
        this.method(Method.POST, plugin, path, options);
    }

    private method(method: Method, plugin: UnisonHTPlugin, path: string, options: RouteOptions): void {
        if (!path.startsWith('/')) {
            if (instanceOfUnisonHTDevice(plugin)) {
                path = this.getDeviceUrlPrefix(plugin) + '/' + path;
            } else if (instanceOfUnisonHTMode(plugin)) {
                path = this.getModeUrlPrefix(plugin) + '/' + path;
            } else {
                throw new Error(`Unhandled plugin type: ${plugin.constructor.name}`);
            }
        }
        const keys: PathToRegexpKey[] = [];
        const regex = pathToRegexp(path, keys);
        this.handlers.push({
            plugin,
            method,
            path,
            keys,
            regex,
            options,
        });
    }

    private async initializePlugins(): Promise<void> {
        for (const plugin of this.plugins) {
            if (plugin.initialize) {
                await plugin.initialize(this);
            }
            if (instanceOfUnisonHTDevice(plugin)) {
                const device = plugin as UnisonHTDevice;
                this.get(plugin, `/device/${device.getDeviceName()}`, {
                    handler: this.handleDeviceInfo.bind(this, device),
                });
                this.post(plugin, `/device/${device.getDeviceName()}/button/:button`, {
                    handler: this.handleButtonPress.bind(this, device),
                });
            } else if (instanceOfUnisonHTMode(plugin)) {
                const mode = plugin as UnisonHTMode;
                this.get(plugin, `/mode/${mode.getModeName()}`, {
                    handler: this.handleModeInfo.bind(this, mode),
                });
                this.post(plugin, `/mode/${mode.getModeName()}/button/:button`, {
                    handler: this.handleButtonPress.bind(this, mode),
                });
            }
        }
    }

    private async handleButtonPress(
        plugin: UnisonHTPlugin,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        const button = request.parameters.button;
        if (!button) {
            throw Error(`Missing 'button' parameter`);
        }
        debug(`handleButtonPress(plugin=${plugin.constructor.name}, button=${button})`);
        const newNext = async (err?: Error) => {
            if (err) {
                next(err);
                return;
            }
            try {
                if (instanceOfUnisonHTDevice(plugin)) {
                    const req = {
                        ...request,
                        url: `/mode/current/button/${button}`,
                    };
                    await this.execute(req, response, next);
                } else {
                    next();
                }
            } catch (err) {
                next(err);
            }
        };
        if (plugin.handleButtonPress) {
            try {
                await plugin.handleButtonPress(button, request, response, newNext);
            } catch (err) {
                next(err);
            }
        } else {
            const foundButton = plugin.getSupportedButtons()[button];
            if (!foundButton) {
                next();
            } else {
                try {
                    await foundButton.handleButtonPress(button, request, response, next);
                } catch (err) {
                    next(err);
                }
            }
        }
    }

    private async handleModeInfo(
        mode: UnisonHTMode,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
    ): Promise<void> {
        await response.send({
            type: mode.constructor.name,
        });
    }

    private async handleDeviceInfo(
        device: UnisonHTDevice,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
    ): Promise<void> {
        let status;
        try {
            status = await device.getStatus();
        } catch (err) {
            console.error(`Could not get device "${device.getDeviceName()}" status`, err);
            status = {
                error: err.message,
            };
        }
        const handlers = this.handlers
            .filter((handler) => handler.plugin === device)
            .map((handler) => {
                return {
                    method: handler.method,
                    path: handler.path,
                };
            });
        const buttons: DeviceStatusResponseButtons = {};
        const deviceButtons = device.getSupportedButtons();
        Object.keys(deviceButtons).forEach((button) => {
            const b = deviceButtons[button];
            buttons[button] = {
                name: b.name,
                description: b.description,
            };
        });
        const statusResponse: DeviceStatusResponse = {
            type: device.constructor.name,
            handlers,
            buttons,
            ...status,
        };
        await response.send(statusResponse);
    }

    public async changeMode(newMode: string): Promise<void> {
        const currentMode = this.getCurrentMode();
        debug(`switching modes "${currentMode ? currentMode.getModeName() : ''}" -> "${newMode}"`);
        if (currentMode && currentMode.exit) {
            await currentMode.exit();
        }
        const m = this.getMode(newMode);
        if (!m) {
            throw new Error(`invalid mode "${newMode}"`);
        }
        this.currentMode = newMode;
        if (m.enter) {
            await m.enter();
        }
    }

    public getDeviceUrlPrefix(device: UnisonHTDevice): string {
        return `/device/${device.getDeviceName()}`;
    }

    public getModeUrlPrefix(mode: UnisonHTMode): string {
        return `/mode/${mode.getModeName()}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async executeGet(url: string): Promise<any> {
        return this.executeUrl(Method.GET, url);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async executePost(url: string): Promise<any> {
        return this.executeUrl(Method.POST, url);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async executeUrl(method: Method, url: string): Promise<any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Promise<any>((resolve, reject) => {
            const request: RouteHandlerRequest = {
                method,
                url,
                unisonht: this,
                parameters: {},
            };
            const response: RouteHandlerResponse = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                send: (result?: any) => {
                    resolve(result);
                },
            };
            const next = (err?: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                reject(new NotFoundError(request.url));
            };
            this.execute(request, response, next).catch((err) => {
                reject(err);
            });
        });
    }

    public async redirect(
        newUrl: string,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        await this.execute(
            {
                ...request,
                url: newUrl,
            },
            response,
            next,
        );
    }

    public async execute(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        debug(`execute(url=${request.url})`);
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
                parameters: {},
            };
            for (let k = 0; k < handler.keys.length; k++) {
                const key = handler.keys[k];
                req.parameters[key.name] = decodeURIComponent(m[k + 1]);
            }
            parsedUrl.searchParams.forEach((value, key) => {
                req.parameters[key] = value;
            });

            const res: RouteHandlerResponse = {
                ...response,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private loadSettings(): any {
        if (!this.options.settingsFileName) {
            throw new Error('settingsFileName option not set');
        }
        const defaultSettings = {
            devices: {},
            modes: {},
        };
        if (!fs.existsSync(this.options.settingsFileName)) {
            return defaultSettings;
        }
        const data = fs.readFileSync(this.options.settingsFileName, 'utf8');
        return {
            ...defaultSettings,
            ...JSON.parse(data),
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private saveSettings(settings: any) {
        if (!this.options.settingsFileName) {
            throw new Error('settingsFileName option not set');
        }
        fs.writeFileSync(this.options.settingsFileName, JSON.stringify(settings, null, 2));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getSetting(plugin: UnisonHTPlugin, name: string): any {
        debug(`getSetting ${name}`);
        const settings = this.loadSettings();
        let pluginData;
        if (instanceOfUnisonHTDevice(plugin)) {
            pluginData = settings.devices[(plugin as UnisonHTDevice).getDeviceName()] || {};
        } else if (instanceOfUnisonHTMode(plugin)) {
            pluginData = settings.modes[(plugin as UnisonHTMode).getModeName()] || {};
        } else {
            throw new Error(`unhandled plugin type: ${plugin}`);
        }
        return pluginData[name];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public setSetting(plugin: UnisonHTPlugin, name: string, value: any): void {
        debug(`setSetting ${name}: ${value}`);
        const settings = this.loadSettings();
        let pluginData;
        if (instanceOfUnisonHTDevice(plugin)) {
            const key = (plugin as UnisonHTDevice).getDeviceName();
            pluginData = settings.devices[key] = settings.devices[key] || {};
        } else if (instanceOfUnisonHTMode(plugin)) {
            const key = (plugin as UnisonHTMode).getModeName();
            pluginData = settings.modes[key] = settings.modes[key] || {};
        } else {
            throw new Error(`unhandled plugin type: ${plugin}`);
        }
        pluginData[name] = value;
        this.saveSettings(settings);
    }
}
