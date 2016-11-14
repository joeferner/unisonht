export interface DeviceOptions {

}

export class Device {
  constructor(options: DeviceOptions) {

  }

  changeInput(input: string): Promise<void> {
    throw new Error('Changing input is not supported for this device');
  }

  buttonPress(button: string): Promise<void> {
    throw new Error('button press is not supported for this device');
  }

  ensureOn(): Promise<void> {
    throw new Error('ensure on is not supported for this device');
  }

  ensureOff(): Promise<void> {
    throw new Error('ensure off is not supported for this device');
  }
}

