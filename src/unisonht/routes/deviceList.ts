import { UnisonHTRequest } from '../UnisonHTRequest';

export async function deviceList(req: UnisonHTRequest): Promise<DeviceListResponse> {
  return {
    devices: req.app.devices.map(device => {
      return {
        name: device.name,
      };
    }),
  };
}

interface DeviceListResponse {
  devices: DeviceListItem[];
}

interface DeviceListItem {
  name: string;
}
