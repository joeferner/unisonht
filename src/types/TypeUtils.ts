import { createCheckers } from "ts-interface-checker";
import ConfigTypeInfo from "../../dist/Config-ti";
import {
    Action,
    Config,
    DeviceConfig,
    ForwardToDeviceAction,
    ModeConfig,
    SwitchModeAction
} from "./Config";

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

function validateModeConfig(config: Config, mode: ModeConfig): void {
  for (const button of mode.buttons) {
    for (const action of button.actions) {
      validateActionConfig(config, action);
    }
  }
}

function validateActionConfig(config: Config, action: Action): void {
  switch (action.type) {
    case "forwardToDevice":
      return validateForwardToDeviceAction(
        config,
        action as ForwardToDeviceAction
      );
    case "switchMode":
      return validateSwitchModeAction(config, action as SwitchModeAction);
    default:
      throw new Error(`unhandled action type: ${action.type}`);
  }
}

function validateForwardToDeviceAction(
  config: Config,
  action: ForwardToDeviceAction
): void {
  typeCheckers.ForwardToDeviceAction.check(action);
  if (!config.devices.find((d) => d.id === action.deviceId)) {
    throw new Error(`Could not find device: ${action.deviceId}`);
  }
}

function validateSwitchModeAction(
  config: Config,
  action: SwitchModeAction
): void {
  typeCheckers.SwitchModeAction.check(action);
  if (!config.modes.find((m) => m.id === action.modeId)) {
    throw new Error(`Could not find mode: ${action.modeId}`);
  }
}

function validateDeviceConfig(config: Config, device: DeviceConfig): void {
  for (const modeId of device.activeModeIds) {
    if (!config.modes.find((m) => m.id === modeId)) {
      throw new Error(`Could not find mode: ${modeId}`);
    }
  }
}
