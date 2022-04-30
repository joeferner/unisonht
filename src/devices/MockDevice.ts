import { UnisonHTServer } from '..';
import { DeviceConfig } from '../types/Config';
import { Device, DeviceFactory, PowerState } from '../types/Device';

export class MockDeviceFactory implements DeviceFactory<MockDeviceConfig> {
  async createDevice(
    server: UnisonHTServer,
    config: DeviceConfig<MockDeviceConfig>,
  ): Promise<Device<MockDeviceConfig>> {
    return new MockDevice(config, server);
  }
}

export class MockDevice extends Device<MockDeviceConfig> {
  private _powerState: PowerState = PowerState.OFF;

  override async switchMode(_oldModeId: string | undefined, newModeId: string): Promise<void> {
    if (this.shouldBeActiveForMode(newModeId)) {
      if (this._powerState === PowerState.OFF) {
        this.debug('turning on');
        this._powerState = PowerState.ON;
      }
    } else {
      if (this._powerState === PowerState.ON) {
        this.debug('turning off');
        this._powerState = PowerState.OFF;
      }
    }
  }

  getPowerState(): Promise<PowerState> {
    return Promise.resolve(this._powerState);
  }

  async handleButtonPress(button: string): Promise<void> {
    this.debug('button press: %s', button);
  }

  override async switchInput(inputName: string): Promise<void> {
    this.debug('switch input: %s', inputName);
  }

  get buttons(): string[] {
    return this.config.data.buttons;
  }
}

export interface MockDeviceConfig {
  buttons: string[];
}
