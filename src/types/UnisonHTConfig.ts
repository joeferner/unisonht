export interface UnisonHTConfig {
  nodes: UnisonHTNodeConfig[];
  edges: UnisonHTEdgeConfig[];
}

export interface UnisonHTNodeConfig {
  id: string;
  pluginId: string;
  data: any;
}

export interface UnisonHTEdgeConfig {
  fromNodeId: string;
  fromNodeOutput: string;
  toNodeId: string;
  toNodeInput: string;
}
