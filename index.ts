/// <reference path="./unisonht.d.ts" />

import {Device} from "./lib/Device";
import {Input} from "./lib/Input";
import log from "./lib/Log";

export default class UnisonHT {
  private inputs: {[name: string]: Input} = {};
  private devices: {[name: string]: Device} = {};
  private modes: {[name: string]: Mode} = {};
  private defaultMode: string;
  private currentMode: Mode;

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

  switchMode(mode: string): Promise<void> {
    log.debug('switch mode: %s', mode);
    throw new Error('not implemented');
  }

  getDevice(deviceName: string): Device {
    return this.devices[deviceName];
  }

  start(): void {
    for (let inputName in this.inputs) {
      let input = this.inputs[inputName];
      input.start(this);
    }

    if (this.defaultMode) {
      this.currentMode = this.modes[this.defaultMode];
    }
    log.info('UnisonHT Started');
  }

  stop(): void {
    for (let inputName in this.inputs) {
      let input = this.inputs[inputName];
      input.stop(this);
    }
    log.info('UnisonHT Stopped');
  }
}
