export interface UnisonHTConfig {
  version: 1;
  defaultMode: string;
  modes: string[];
  devices: UnisonHTDeviceConfig[];
}

export interface UnisonHTDeviceConfig {
  id: string;
  deviceFactoryId: string;
  name?: string;
  activeModes: string[];
  data: any;
}
