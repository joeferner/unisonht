import { Config, DeviceConfig, ModeConfig } from './Config';
import { createGenerator } from 'ts-json-schema-generator';
import path from 'path';
import Ajv from 'ajv';
import Debug from 'debug';

const debug = Debug('unisonht:TypeUtils');

export function validateJson(type: string, json: unknown, options: { sourcePath: string; tsconfigPath: string }): void {
  debug('validating json using %s (%s)', options.sourcePath, options.tsconfigPath);
  const schemaGenerator = createGenerator({
    path: options.sourcePath,
    tsconfig: options.tsconfigPath,
  });
  const schema = schemaGenerator.createSchema(type);
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  if (!validate(json)) {
    const details = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join('\n');
    throw new Error(`invalid config:\n${details}`);
  }
}

export function validateConfig(config: Config): void {
  validateJson('Config', config, {
    sourcePath: path.join(__dirname, 'Config.ts'),
    tsconfigPath: path.join(__dirname, '../../tsconfig.json'),
  });

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
