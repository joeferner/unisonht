export interface DeviceOptions {

}

export class Device {
  constructor(options: DeviceOptions) {

  }

  changeInput(input: string): Promise<void> {
    return Promise.reject(new Error('Changing input to ' + input + ' is not supported for this device (' + this.constructor.name + ')'));
  }

  buttonPress(button: string): Promise<void> {
    return Promise.reject(new Error('button ' + button + ' is not supported for this device (' + this.constructor.name + ')'));
  }

  ensureOn(): Promise<void> {
    return Promise.resolve();
  }

  ensureOff(): Promise<void> {
    return Promise.resolve();
  }
}

