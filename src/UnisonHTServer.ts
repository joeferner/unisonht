import Debug from 'debug';
import express, { Express } from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { createRouter, routerGetControllers } from './routes';
import { Action, ActionFactory } from './types/Action';
import { ActionConfig, Config } from './types/Config';
import { Device, DeviceFactory } from './types/Device';
import { getStatusCodeFromError } from './types/ErrorWithStatusCode';
import { Mode } from './types/Mode';
import { OpenApi } from './types/openApi/v3/OpenApi';
import { openApiDecoratorsUpdateOpenApi } from './types/openApiDecorators';
import { Plugin, PluginFactory } from './types/Plugin';

export class UnisonHTServer {
  private readonly debug = Debug('unisonht:unisonht:server');
  private readonly app: Express;
  private readonly deviceFactories: DeviceFactory<unknown>[] = [];
  private readonly pluginFactories: PluginFactory<unknown>[] = [];
  private readonly actionFactories: ActionFactory<ActionConfig>[] = [];
  private readonly _devices: Device<unknown>[] = [];
  private readonly _modes: Mode[] = [];
  private readonly _plugins: Plugin<unknown>[] = [];
  private readonly _config: Config;
  private _modeId?: string;

  constructor(config?: Config) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    this.app.get('/swagger.json', (_req, resp, next) => {
      this.getOpenApi()
        .then((openApi) => resp.json(openApi))
        .catch((err) => next(err));
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

  private async getOpenApi(): Promise<OpenApi> {
    const openApi: OpenApi = {
      openapi: '3.0.0',
      info: {
        title: 'UnisonHT',
        version: '1.0.0',
      },
      paths: {},
    };

    [...routerGetControllers(), ...this.plugins, ...this.modes, ...this.devices].forEach((o) => {
      const t = o.getOpenApiType();
      if (t) {
        openApiDecoratorsUpdateOpenApi(openApi, o, t);
      }
      o.updateOpenApi(openApi);
    });

    return openApi;
  }

  async start(options?: { port?: number }): Promise<void> {
    await this.createModes();
    await this.createPlugins();
    await this.createDevices();
    await this.switchMode(this.config.defaultModeId);

    this.getOpenApi().catch(console.error);

    const angularPath = path.join(__dirname, '..', 'public', 'dist', 'unisonht-public');

    return new Promise((resolve) => {
      const port = options?.port || 4201;
      this.app.use(express.static(angularPath));
      this.app.all('/*', (_req, res) => {
        res.sendFile('index.html', { root: angularPath });
      });
      this.app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
        this.debug('error: %o', err);
        if (res.headersSent) {
          return next(err);
        }
        res.status(getStatusCodeFromError(err) ?? 500);
        res.json({ error: err.message });
      });
      this.app.listen(port, () => {
        this.debug(`listening http://localhost:${port}`);
        resolve();
      });
    });
  }

  private async createPlugins(): Promise<void> {
    for (const pluginConfig of this.config.plugins) {
      const pluginFactory = await this.getPluginFactory(pluginConfig.pluginFactory);
      if (!pluginFactory) {
        throw new Error(`Could not find plugin factory: ${pluginConfig.pluginFactory}`);
      }
      const plugin = await pluginFactory.createPlugin(this, pluginConfig);
      this.app.use((req, resp, next) => {
        plugin.handleWebRequest(req, resp, next);
      });

      this._plugins.push(plugin);
    }
  }

  private async getPluginFactory(pluginFactoryName: string): Promise<PluginFactory<unknown> | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pluginFactory = this.pluginFactories.find((d) => (d as any).constructor.name === pluginFactoryName);
    if (pluginFactory) {
      return pluginFactory;
    }

    pluginFactory = this.instantiateClass(pluginFactoryName);
    if (pluginFactory) {
      this.pluginFactories.push(pluginFactory);
      return pluginFactory;
    }

    return undefined;
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
      const deviceFactory = await this.getDeviceFactory(deviceConfig.deviceFactory);
      if (!deviceFactory) {
        throw new Error(`Could not find device factory: ${deviceConfig.deviceFactory} for device ${deviceConfig.id}`);
      }
      const device = await deviceFactory.createDevice(this, deviceConfig);

      this.app.use((req, resp, next) => {
        device.handleWebRequest(req, resp, next);
      });

      this._devices.push(device);
    }
  }

  private async getDeviceFactory(deviceFactoryName: string): Promise<DeviceFactory<unknown> | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deviceFactory = this.deviceFactories.find((d) => (d as any).constructor.name === deviceFactoryName);
    if (deviceFactory) {
      return deviceFactory;
    }

    deviceFactory = this.instantiateClass(deviceFactoryName);
    if (deviceFactory) {
      this.deviceFactories.push(deviceFactory);
      return deviceFactory;
    }

    return undefined;
  }

  private instantiateClass<T>(qualifiedName: string): T | undefined {
    const parts = qualifiedName.split(':', 2);
    if (parts.length === 2 && parts[0] && parts[1]) {
      const module = this.loadModule(parts[0]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedClass = module[parts[1]] as any;
      if (loadedClass) {
        return new loadedClass();
      }
    }
    return undefined;
  }

  private loadModule(moduleNameOrPath: string): Record<string, unknown> {
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

  createAction(actionConfig: ActionConfig): Action<ActionConfig> {
    const actionFactory = this.actionFactories.find((f) => f.type === actionConfig.type);
    if (!actionFactory) {
      throw new Error(`invalid action ${actionConfig.type}`);
    }
    return actionFactory.createAction(this, actionConfig);
  }

  addActionFactory(actionFactory: ActionFactory<ActionConfig>): void {
    this.actionFactories.push(actionFactory);
  }

  addDeviceFactory(deviceFactory: DeviceFactory<unknown>): void {
    this.deviceFactories.push(deviceFactory);
  }

  addPluginFactory(pluginFactory: PluginFactory<unknown>): void {
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
          if (!input) {
            throw new Error('invalid state');
          }
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

  get devices(): Device<unknown>[] {
    return this._devices;
  }

  get modes(): Mode[] {
    return this._modes;
  }

  get plugins(): Plugin<unknown>[] {
    return this._plugins;
  }
}
