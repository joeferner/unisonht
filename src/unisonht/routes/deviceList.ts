import { UnisonHTRequest } from '../UnisonHTRequest';

export async function deviceList(req: UnisonHTRequest): Promise<DeviceListResponse> {
  return {
    deviceNames: req.app.devices.map(device => device.name),
  };
}

interface DeviceListResponse {
  deviceNames: string[];
}
