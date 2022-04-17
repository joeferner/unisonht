export interface WebInterfaceDeviceData {
  url: string;
  buttons: WebInterfaceDeviceDataButton[];
}

export interface WebInterfaceDeviceDataButton {
  name: string;
  value: string;
  row: number;
  column: number;
  width: number;
}

export interface WebInterfaceNodeData {
  outputs: WebInterfaceNodeDataOutput[];
}

export interface WebInterfaceNodeDataOutput {
  name: string;
  values: string[];
}
