import { UnisonHTServer } from "..";
import { UnisonHTDeviceConfig } from "../types/UnisonHTConfig";
import { PowerState, UnisonHTDevice } from "../types/UnisonHTDevice";
import { UnisonHTDeviceFactory } from "../types/UnisonHTDeviceFactory";
import Debug from "debug";

export class MockDeviceFactory implements UnisonHTDeviceFactory {
  get id(): string {
    return "unisonht:mock-device";
  }

  async createDevice(
    server: UnisonHTServer,
    config: UnisonHTDeviceConfig
  ): Promise<UnisonHTDevice> {
    return new MockDevice(config.id, config, server);
  }
}

export class MockDevice extends UnisonHTDevice {
  private readonly debug = Debug(`unisonht:unisonht:mockDevice:${this.id}`);
  private _powerState: PowerState = PowerState.OFF;

  override async switchMode(
    oldMode: string | undefined,
    newMode: string
  ): Promise<void> {
    if (this.shouldBeActiveForMode(newMode)) {
      if (this._powerState === PowerState.OFF) {
        this.debug("turning on");
        this._powerState = PowerState.ON;
      }
    } else {
      if (this._powerState === PowerState.ON) {
        this.debug("turning off");
        this._powerState = PowerState.OFF;
      }
    }
  }

  getPowerState(): Promise<PowerState> {
    return Promise.resolve(this._powerState);
  }
}
