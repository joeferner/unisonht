export interface UnisonHTConfig {
  version: 1;
  defaultMode: string;
  modes: string[];
  devices: UnisonHTDeviceConfig[];
  nodes: UnisonHTNodeConfig[];
  edges: UnisonHTEdgeConfig[];
}

export interface UnisonHTDeviceConfig {
  id: string;
  deviceFactoryId: string;
  name?: string;
  activeModes?: string[];
  data: any;
}

export interface UnisonHTNodeConfig {
  id: string;
  nodeFactoryId?: string;
  deviceId?: string;
  name?: string;
  activeModes?: string[];
  data: any;
}

export interface UnisonHTEdgeConfig {
  id: string;
  fromNodeId: string;
  fromNodeOutput: string;
  toNodeId: string;
  toNodeInput: string;
}
