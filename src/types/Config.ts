export interface Config {
  version: 1;
  defaultModeId: string;
  modes: ModeConfig[];
  devices: DeviceConfig[];
  plugins: PluginConfig[];
}

export interface ModeConfig {
  id: string;
  name: string;
  buttons: ModeConfigButton[];
}

export interface ModeConfigButton {
  name: string;
  actions: ActionConfig[];
}

export interface ActionConfig {
  type: string;
}

export interface DeviceConfig {
  id: string;
  deviceFactoryId: string;
  name: string;
  activeModeIds: string[];
  data: any;
}

export interface PluginConfig {
  id: string;
  name: string;
  pluginFactoryId: string;
  data: any;
}
