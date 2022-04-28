import { createCheckers } from "ts-interface-checker";
import ConfigTypeInfo from "../../dist/Config-ti";
import { Config, DeviceConfig, ModeConfig } from "./Config";

const typeCheckers = createCheckers(ConfigTypeInfo);

export function validateConfig(config: Config): void {
  typeCheckers.Config.check(config);

  for (const mode of config.modes) {
    validateModeConfig(config, mode);
  }

  for (const device of config.devices) {
    validateDeviceConfig(config, device);
  }
}

function validateModeConfig(config: Config, mode: ModeConfig): void {}

function validateDeviceConfig(config: Config, device: DeviceConfig): void {
  for (const modeId of device.activeModeIds) {
    if (!config.modes.find((m) => m.id === modeId)) {
      throw new Error(`Could not find mode: ${modeId}`);
    }
  }
}
