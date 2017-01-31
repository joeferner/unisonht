import createLogger from "./lib/Log";

const log = createLogger('unisonht');
type ButtonFunction = (inputData: InputData) => Promise<void>;

export interface UnisonHTPlugin {
  getName(): string
  start?(unisonht: UnisonHT): Promise<void>;
  stop?(): Promise<void>;
  onDeviceButtonPress?: (device: UnisonHTDevice, button: string) => Promise<boolean>;
}

export interface Mode {
  buttonMap?: {
    [name: string]: ButtonFunction|string
  };
  onEnter?: () => Promise<void>;
  onExit?: () => Promise<void>;
  onDeviceButtonPress?: (device: UnisonHTDevice, button: string) => Promise<boolean>;
  defaultDevice?: string;
}

export interface InputData {
  remote?: string;
  button: string;
  repeat?: number;
}

export interface DeviceInput {
  deviceInput: string;
  mappedInput: string;
}

export interface UnisonHTDevice extends UnisonHTPlugin {
  changeInput?(input: string): Promise<void>;
  buttonPress(button: string): Promise<void>;
  ensureOn(): Promise<void>;
  ensureOff(): Promise<void>;
}

export interface UnisonHTInput extends UnisonHTPlugin {

}

export class UnisonHT {
  private plugins: {[name: string]: UnisonHTPlugin} = {};
  private modes: {[name: string]: Mode} = {};
  private defaultMode: string;
  private currentMode: string;
  private keepAliveInterval: NodeJS.Timer;

  static get MODE_GLOBAL() {
    return 'GLOBAL';
  }

  use(plugin: UnisonHTPlugin): void {
    log.debug('Add plugin: %s', plugin.getName());
    this.plugins[plugin.getName()] = plugin;
  }

  setDefaultMode(mode: string): void {
    log.debug('Set default mode to: %s', mode);
    this.defaultMode = mode;
  }

  addMode(name: string, options: Mode): void {
    log.debug('Add mode: %s', name);
    options.buttonMap = options.buttonMap || {};
    this.modes[name] = options;
  }

  switchMode(modeName: string): Promise<void> {
    log.debug('switching mode: %s => %s', this.currentMode, modeName);
    const newMode = this.getMode(modeName);
    if (!newMode) {
      return Promise.reject(new Error('Could not find mode with name: ' + modeName));
    }

    const currentMode = this.getCurrentMode();
    const currentModeExitPromise = currentMode && currentMode.onExit
      ? currentMode.onExit()
      : Promise.resolve();
    const newModeEnterPromise = newMode.onEnter
      ? newMode.onEnter()
      : Promise.resolve();
    return Promise.all([
      currentModeExitPromise,
      newModeEnterPromise
    ])
      .then(() => {
        log.debug(`new mode now: ${modeName}`);
        this.currentMode = modeName;
      })
      .catch((err) => {
        log.error('failed to switch mode', err);
        throw err;
      })
  }

  getCurrentMode(): Mode {
    return this.modes[this.currentMode];
  }

  getMode(name: string): Mode {
    return this.modes[name];
  }

  getDevice(deviceName: string): UnisonHTDevice {
    const plugin = this.plugins[deviceName];
    if ('buttonPress' in plugin) {
      return <UnisonHTDevice> plugin;
    }
    return null;
  }

  start(): Promise<void> {
    const promises = [];
    this.currentMode = this.defaultMode;

    for (let pluginName in this.plugins) {
      let plugin = this.plugins[pluginName];
      if (plugin.start) {
        log.debug(`starting ${plugin.getName()}`);
        promises.push(plugin.start(this));
      }
    }

    return Promise.all(promises)
      .then(() => {
        log.info('UnisonHT Started');
        this.keepAliveInterval = setInterval(() => {

        }, 1000);
      });
  }

  stop(): Promise<void> {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    const promises = [];
    for (let pluginName in this.plugins) {
      let plugin = this.plugins[pluginName];
      if (plugin.stop) {
        promises.push(plugin.stop());
      }
    }

    return Promise.all(promises)
      .then(() => {
        log.info('UnisonHT Stopped');
      });
  }

  processInput(inputData: InputData): Promise<void> {
    const button = this.findButton(inputData);
    if (!button || typeof button === 'string') {
      return this.processButtonPress(<string>button || inputData.button);
    }
    return button(inputData);
  }

  processButtonPress(button: string): Promise<void> {
    const mode = this.getCurrentMode();
    if (mode && mode.defaultDevice) {
      const device = this.getDevice(mode.defaultDevice);
      if (device) {
        let promise = Promise.resolve(true);
        if (this.getCurrentMode() && this.getCurrentMode().onDeviceButtonPress) {
          promise = this.getCurrentMode().onDeviceButtonPress(device, button);
        }
        for (let pluginName in this.plugins) {
          let plugin = this.plugins[pluginName];
          if (plugin.onDeviceButtonPress) {
            promise = promise.then((cont) => {
              if (cont) {
                return plugin.onDeviceButtonPress(device, button);
              }
              return false;
            });
          }
        }
        return promise
          .then((cont) => {
            if (cont) {
              return device.buttonPress(button);
            }
          });
      }
    }
    return Promise.resolve();
  }

  private findButton(inputData: InputData): ButtonFunction|string {
    let mode = this.getCurrentMode();
    if (mode) {
      const button = UnisonHT.findButtonInMode(mode, inputData);
      if (button) {
        return button;
      }
    }

    mode = this.getMode(UnisonHT.MODE_GLOBAL);
    if (mode) {
      const button = UnisonHT.findButtonInMode(mode, inputData);
      if (button) {
        return button;
      }
    }

    return null;
  }

  private static findButtonInMode(mode: Mode, inputData: InputData): ButtonFunction|string {
    if (inputData.button) {
      const button = mode.buttonMap[inputData.button];
      if (button) {
        return button;
      }
      return mode.buttonMap[inputData.remote + ':' + inputData.button];
    }
    return null;
  }
}
