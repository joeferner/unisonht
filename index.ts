/// <reference path="./unisonht.d.ts" />

import {Device} from "./lib/Device";
import {Input} from "./lib/Input";
import createLogger from "./lib/Log";

const log = createLogger('unisonht');

export default class UnisonHT {
  private inputs: {[name: string]: Input} = {};
  private devices: {[name: string]: Device} = {};
  private modes: {[name: string]: Mode} = {};
  private defaultMode: string;
  private currentMode: string;

  static get MODE_GLOBAL() {
    return 'GLOBAL';
  }

  addInput(name: string, input: Input): void {
    log.debug('Add input: %s', name);
    this.inputs[name] = input;
  }

  addDevice(name: string, device: Device): void {
    log.debug('Add device: %s', name);
    this.devices[name] = device;
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

  getDevice(deviceName: string): Device {
    return this.devices[deviceName];
  }

  start(): void {
    for (let inputName in this.inputs) {
      let input = this.inputs[inputName];
      input.start(this);
    }

    this.currentMode = this.defaultMode;
    log.info('UnisonHT Started');
  }

  stop(): void {
    for (let inputName in this.inputs) {
      let input = this.inputs[inputName];
      input.stop(this);
    }
    log.info('UnisonHT Stopped');
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
