export interface UnisonHTConfig {
  defaultMode: string;
  modes: string[];
  nodes: UnisonHTNodeConfig[];
  edges: UnisonHTEdgeConfig[];
}

export interface UnisonHTNodeConfig {
  id: string;
  pluginId: string;
  activeModes?: string[];
  data: any;
}

export interface UnisonHTEdgeConfig {
  fromNodeId: string;
  fromNodeOutput: string;
  toNodeId: string;
  toNodeInput: string;
}
