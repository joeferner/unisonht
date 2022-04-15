export interface UnisonHTConfig {
  nodes: UnisonHTNodeConfig[];
}

export interface UnisonHTNodeConfig {
  id: string;
  pluginId: string;
  data: any;
}
