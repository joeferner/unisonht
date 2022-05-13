import { getType, Type } from 'tst-reflect';
import { Config, DeviceConfig, ModeConfig } from './Config';
import { createJsonSchema } from 'tst-reflect-json-schema-generator';

export function validateJson(type: Type, json: any): void {
  try {
    internalValidateJson(type, json);
  } catch (err) {
    if ((err as any).path) {
      throw new Error(`${(err as any).message} at ${(err as any).path}`);
    } else {
      throw err;
    }
  }
}

function internalValidateJson(type: Type, json: any): void {
  try {
    if (type.isArray()) {
      if (!Array.isArray(json)) {
        throw createValidateError('expecting array', type.name);
      }
      const elemType = type.getTypeArguments()[0];
      if (!elemType) {
        throw new Error(`invalid type: ${type.name}`);
      }
      for (const i in json) {
        try {
          internalValidateJson(elemType, json[i]);
        } catch (err) {
          let path = (err as any).path as string | undefined;
          if (path) {
            throw createValidateError((err as any).message, `[${i}]${path}`);
          } else {
            throw err;
          }
        }
      }
    } else if (type.name === 'String') {
      if (typeof json !== 'string') {
        throw createValidateError('expecting string', type.name);
      }
    } else if (type.name === 'number') {
      if (typeof json !== 'number') {
        throw createValidateError('expecting number', type.name);
      }
    } else {
      if (type.getProperties().length === 0) {
        throw createValidateError('unhandled type', type.name);
      }
    }

    for (const prop of type.getProperties()) {
      const propValue = json[prop.name];
      if (!propValue) {
        throw createValidateError('missing property', prop.name);
      }
      internalValidateJson(prop.type, propValue);
    }
  } catch (err) {
    throw createValidateError((err as Error).message, `${type.name}.${(err as any).path}`);
  }
}

function createValidateError(message: string, path: string): Error {
  const err = new Error(message);
  (err as any).path = path;
  return err;
}

export function validateConfig(config: Config): void {
  const configSchema = createJsonSchema(getType<Config>());
  console.log(configSchema);
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
