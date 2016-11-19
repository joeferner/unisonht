/// <reference path="./typings/index.d.ts" />

import createLogger from "./lib/Log";

const log = createLogger('unisonht');
type ButtonFunction = ()=>Promise<void>;

export interface UnisonHTPlugin {
  getName(): string
  start?(unisonht: UnisonHT): Promise<void>;
  stop?(): Promise<void>;
}

export interface Mode {
  buttonMap?: {
    [name: string]: ButtonFunction
  },
  onEnter?: ()=>Promise<void>,
  onExit?: ()=>Promise<void>,
  defaultDevice?: string
}

export interface InputData {
  remote?: string,
  button: string,
  repeat?: number
}

export interface DeviceInput {
  deviceInput: string,
  mappedInput: string
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
    ]);
  }

  getCurrentMode(): Mode {
    return this.modes[this.currentMode];
  }

  getMode(name: string): Mode {
    return this.modes[name];
  }

  getDevice(deviceName: string): UnisonHTDevice {
    const plugin = this.plugins[deviceName];
    if ('pressButton' in plugin) {
      return <UnisonHTDevice> plugin;
    }
    return null;
  }

  start(): Promise<void> {
    const startFunctions = [];
    this.currentMode = this.defaultMode;

    for (let pluginName in this.plugins) {
      let plugin = this.plugins[pluginName];
      if (plugin.start) {
        startFunctions.push(plugin.start);
      }
    }

    return Promise.all(startFunctions)
      .then(()=> {
        log.info('UnisonHT Started');
      });
  }

  stop(): Promise<void> {
    const stopFunctions = [];
    for (let pluginName in this.plugins) {
      let plugin = this.plugins[pluginName];
      if (plugin.stop) {
        stopFunctions.push(plugin.stop);
      }
    }

    return Promise.all(stopFunctions)
      .then(()=> {
        log.info('UnisonHT Stopped');
      });
  }

  processInput(inputData: InputData): Promise<void> {
    const button = this.findButton(inputData);
    if (!button) {
      return Promise.resolve();
    }
    return button();
  }

  private findButton(inputData: InputData): ButtonFunction {
    var mode = this.getCurrentMode();
    if (mode) {
      var button = UnisonHT.findButtonInMode(mode, inputData);
      if (button) {
        return button;
      }
    }

    mode = this.getMode(UnisonHT.MODE_GLOBAL);
    if (mode) {
      var button = UnisonHT.findButtonInMode(mode, inputData);
      if (button) {
        return button;
      }
    }

    return null;
  }

  private static findButtonInMode(mode: Mode, inputData: InputData): ButtonFunction {
    if (inputData.button) {
      var button = mode.buttonMap[inputData.button];
      if (button) {
        return button;
      }
      return mode.buttonMap[inputData.remote + ':' + inputData.button];
    }
    return null;
  }
}
