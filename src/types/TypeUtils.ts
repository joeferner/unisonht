import { Config, DeviceConfig, ModeConfig } from './Config';

export function validateConfig(config: Config): void {
  for (const mode of config.modes) {
    validateModeConfig(config, mode);
  }

  for (const device of config.devices) {
    validateDeviceConfig(config, device);
  }
}

function validateModeConfig(config: Config, mode: ModeConfig): void {
  // TODO
}

function validateDeviceConfig(config: Config, device: DeviceConfig<unknown>): void {
  for (const modeId of device.activeModeIds) {
    if (!config.modes.find((m) => m.id === modeId)) {
      throw new Error(`Could not find mode: ${modeId}`);
    }
  }
}
