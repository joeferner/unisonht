import Debug from 'debug';
import express, { Express } from 'express';
import { NextFunction, ParamsDictionary, Request, Response } from 'express-serve-static-core';
import path from 'path';
import { ParsedQs } from 'qs';
import swaggerUi from 'swagger-ui-express';
import { createRouter, routerUpdateSwaggerJson } from './routes';
import { Action, ActionFactory } from './types/Action';
import { ActionConfig, Config } from './types/Config';
import { Device, DeviceFactory } from './types/Device';
import { getStatusCodeFromError } from './types/ErrorWithStatusCode';
import { Mode } from './types/Mode';
import { Plugin, PluginFactory } from './types/Plugin';

export class UnisonHTServer {
  private readonly debug = Debug('unisonht:unisonht:server');
  private readonly app: Express;
  private readonly deviceFactories: DeviceFactory<any>[] = [];
  private readonly pluginFactories: PluginFactory<any>[] = [];
  private readonly actionFactories: ActionFactory<any>[] = [];
  private readonly _devices: Device<any>[] = [];
  private readonly _modes: Mode[] = [];
  private readonly _plugins: Plugin<any>[] = [];
  private readonly _config: Config;
  private _modeId?: string;

  constructor(config?: Config) {
    // eslint-disable-next-line
    const swaggerJson = require(path.join(__dirname, '..', 'dist', 'swagger.json'));
    this._config = {
      version: 1,
      defaultModeId: 'OFF',
      modes: [],
      devices: [],
      plugins: [],
      ...config,
    };

    this.app = express();
    this.app.use(express.json());
    this.app.get('/swagger.json', (_req, resp) => {
      const newSwaggerJson = JSON.parse(JSON.stringify(swaggerJson));

      routerUpdateSwaggerJson(this, newSwaggerJson);
      this.plugins.forEach((plugin) => {
        plugin.updateSwaggerJson(newSwaggerJson);
      });
      this.modes.forEach((mode) => {
        mode.updateSwaggerJson(newSwaggerJson);
      });
      this.devices.forEach((device) => {
        device.updateSwaggerJson(newSwaggerJson);
      });

      resp.json(newSwaggerJson);
    });
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: '/swagger.json',
        },
      }),
    );
    this.app.use(createRouter(this));
  }

  async start(options?: { port?: number }): Promise<void> {
    await this.createModes();
    await this.createPlugins();
    await this.createDevices();
    await this.switchMode(this.config.defaultModeId);

    const angularPath = path.join(__dirname, '..', 'public', 'dist', 'unisonht-public');

    return new Promise((resolve) => {
      const port = options?.port || 4201;
      this.app.use(express.static(angularPath));
      this.app.all('/*', (_req, res) => {
        res.sendFile('index.html', { root: angularPath });
      });
      this.app.use(
        (
          err: Error,
          _req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
          res: Response<any, Record<string, any>, number>,
          next: NextFunction,
        ) => {
          this.debug('error: %o', err);
          if (res.headersSent) {
            return next(err);
          }
          res.status(getStatusCodeFromError(err) ?? 500);
          res.json({ error: err.message });
        },
      );
      this.app.listen(port, () => {
        this.debug(`listening http://localhost:${port}`);
        resolve();
      });
    });
  }

  private async createPlugins(): Promise<void> {
    for (const pluginConfig of this.config.plugins) {
      const pluginFactory = this.pluginFactories.find((i) => i.id === pluginConfig.pluginFactoryId);
      if (!pluginFactory) {
        throw new Error(`Could not find plugin factory: ${pluginConfig.pluginFactoryId}`);
      }
      const plugin = await pluginFactory.createPlugin(this, pluginConfig);
      this.app.use((req, resp, next) => {
        plugin.handleWebRequest(req, resp, next);
      });

      this._plugins.push(plugin);
    }
  }

  private async createModes(): Promise<void> {
    for (const modeConfig of this.config.modes) {
      const mode = new Mode(this, modeConfig);
      this.app.use((req, resp, next) => {
        if (this.modeId === mode.id) {
          mode.handleWebRequest(req, resp, next);
        } else {
          next();
        }
      });
      this._modes.push(mode);
    }
  }

  private async createDevices(): Promise<void> {
    for (const deviceConfig of this.config.devices) {
      const deviceFactory = await this.getDeviceFactory(deviceConfig.deviceFactoryId);
      if (!deviceFactory) {
        throw new Error(`Could not find device factory: ${deviceConfig.deviceFactoryId} for device ${deviceConfig.id}`);
      }
      const device = await deviceFactory.createDevice(this, deviceConfig);

      this.app.use((req, resp, next) => {
        device.handleWebRequest(req, resp, next);
      });

      this._devices.push(device);
    }
  }

  private async getDeviceFactory(deviceFactoryId: string): Promise<DeviceFactory<any> | undefined> {
    const deviceFactory = this.deviceFactories.find((d) => (d as any).constructor.name === deviceFactoryId);
    if (deviceFactory) {
      return deviceFactory;
    }
    const parts = deviceFactoryId.split(':', 2);
    if (parts.length === 2) {
      const module = this.loadModule(parts[0]);
      const deviceFactoryClass = module[parts[1]];
      if (deviceFactoryClass) {
        const deviceFactory = new deviceFactoryClass();
        this.deviceFactories.push(deviceFactory);
        return deviceFactory;
      }
    }
    return undefined;
  }

  private loadModule(moduleNameOrPath: string): any {
    this.debug('loading device module: %s', moduleNameOrPath);
    try {
      return require(moduleNameOrPath);
    } catch (err) {
      if (moduleNameOrPath.startsWith('.')) {
        return require(path.join(process.cwd(), moduleNameOrPath));
      }
      throw err;
    }
  }

  createAction(actionConfig: ActionConfig): Action<any> {
    const actionFactory = this.actionFactories.find((f) => f.type === actionConfig.type);
    if (!actionFactory) {
      throw new Error(`invalid action ${actionConfig.type}`);
    }
    return actionFactory.createAction(this, actionConfig);
  }

  addActionFactory(actionFactory: ActionFactory<any>): void {
    this.actionFactories.push(actionFactory);
  }

  addDeviceFactory(deviceFactory: DeviceFactory<any>): void {
    this.deviceFactories.push(deviceFactory);
  }

  addPluginFactory(pluginFactory: PluginFactory<any>): void {
    this.pluginFactories.push(pluginFactory);
  }

  async switchMode(newModeId: string, deviceInputs?: { [deviceId: string]: string }): Promise<void> {
    const oldModeId = this._modeId;

    if (this.debug.enabled) {
      const oldMode = this.modes.find((m) => m.id === oldModeId);
      const newMode = this.modes.find((m) => m.id === newModeId);
      this.debug(
        'switching mode: %s%s -> %s%s',
        oldModeId ?? 'NOT SET',
        oldMode ? ` (${oldMode.name})` : '',
        newModeId,
        newMode ? ` (${newMode.name})` : '',
      );
    }
    if (!this.config.modes.find((m) => m.id === newModeId)) {
      throw new Error(`invalid mode: ${newModeId}`);
    }

    await Promise.all(
      this.devices.map((device) => {
        return device.switchMode(oldModeId, newModeId);
      }),
    );

    if (deviceInputs) {
      await Promise.all(
        Object.keys(deviceInputs).map((deviceId) => {
          const input = deviceInputs[deviceId];
          const device = this.devices.find((d) => d.id === deviceId);
          if (!device) {
            throw new Error(`could not find device with id: ${deviceId}`);
          }
          return device.switchInput(input);
        }),
      );
    }

    this._modeId = newModeId;
  }

  pressButton(button: string): Promise<void> {
    const mode = this.modes.find((m) => m.id === this.modeId);
    if (!mode) {
      throw new Error('no mode selected');
    }
    return mode.pressButton(button);
  }

  get modeId(): string | undefined {
    return this._modeId;
  }

  get config(): Config {
    return this._config;
  }

  get devices(): Device<any>[] {
    return this._devices;
  }

  get modes(): Mode[] {
    return this._modes;
  }

  get plugins(): Plugin<any>[] {
    return this._plugins;
  }
}
