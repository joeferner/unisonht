export interface UnisonHTConfig {
  version: 1;
  defaultMode: string;
  modes: string[];
  devices: DeviceConfig[];
  irTxRx?: IrTxRxConfig;
}

export interface DeviceConfig {
  id: string;
  deviceFactoryId: string;
  name?: string;
  activeModes: string[];
  data: any;
}

export interface IrTxRxConfig {
  irTxRxFactoryId: string;
  data: any;
}
