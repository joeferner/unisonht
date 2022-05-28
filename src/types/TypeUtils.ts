import { getType, Type } from 'tst-reflect';
import { Config, DeviceConfig, ModeConfig } from './Config';
import { createJsonSchema } from 'tst-reflect-json-schema-generator';
import Ajv from 'ajv';

export function validateJson(type: Type, json: any): void {
  const configSchema = createJsonSchema(type);
  const ajv = new Ajv();
  if (!ajv.validateSchema(configSchema, json)) {
    for (const err of ajv.errors || []) {
      console.error(err);
    }
    throw new Error('invalid json');
  }
}

export function validateConfig(config: Config): void {
  validateJson(getType<Config>(), config);

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
