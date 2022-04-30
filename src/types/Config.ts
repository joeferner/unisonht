export interface Config {
  version: 1;
  defaultModeId: string;
  modes: ModeConfig[];
  devices: DeviceConfig<unknown>[];
  plugins: PluginConfig<unknown>[];
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
  [name: string]: unknown;
}

export interface DeviceConfig<TData> {
  id: string;
  deviceFactory: string;
  name: string;
  activeModeIds: string[];
  data: TData;
}

export interface PluginConfig<TData> {
  id: string;
  name: string;
  pluginFactory: string;
  data: TData;
}
