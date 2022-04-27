export interface Config {
  version: 1;
  defaultModeId: string;
  modes: ModeConfig[];
  devices: DeviceConfig[];
  irTxRx?: IrTxRxConfig;
}

export interface ModeConfig {
  id: string;
  name: string;
  buttons: ModeConfigButton[];
}

export interface ModeConfigButton {
  name: string;
  actions: Action[];
}

export interface Action {
  type: "switchMode" | "forwardToDevice";
}

export interface SwitchModeAction {
  type: "switchMode";
  modeId: string;
  deviceInputs?: { [deviceId: string]: string };
}

export interface ForwardToDeviceAction {
  type: "forwardToDevice";
  deviceId: string;
}

export interface DeviceConfig {
  id: string;
  deviceFactoryId: string;
  name: string;
  activeModes: string[];
  data: any;
}

export interface IrTxRxConfig {
  irTxRxFactoryId: string;
  data: any;
}
