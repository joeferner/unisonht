import { UnisonHTRequest } from '../UnisonHTRequest';
import { getDeviceUrlPrefix } from '../Device';

export async function deviceList(req: UnisonHTRequest): Promise<DeviceListResponse> {
  return {
    devices: req.app.devices.map(device => {
      return {
        name: device.name,
        urlPrefix: getDeviceUrlPrefix(device),
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
