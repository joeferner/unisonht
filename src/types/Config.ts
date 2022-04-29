export interface Config {
  version: 1;
  defaultModeId: string;
  modes: ModeConfig[];
  devices: DeviceConfig<any>[];
  plugins: PluginConfig<any>[];
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

export interface DeviceConfig<TData> {
  id: string;
  deviceFactoryId: string;
  name: string;
  activeModeIds: string[];
  data: TData;
}

export interface PluginConfig<TData> {
  id: string;
  name: string;
  pluginFactoryId: string;
  data: TData;
}
