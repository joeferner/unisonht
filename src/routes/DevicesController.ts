import { Router } from 'express-serve-static-core';
import { PowerState } from '../types/Device';
import { MyGet } from '../types/openApiDecorators';
import { UnisonHTServer } from '../UnisonHTServer';

export class DevicesController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const devicesController = new DevicesController(server);

    router.get('/api/v1/devices', async (_req, res) => {
      res.send(await devicesController.getDevices());
    });
  }

  @MyGet('/api/v1/devices')
  public async getDevices(): Promise<GetDevicesResponse> {
    return {
      devices: await Promise.all(
        this.server.devices.map(async (device) => {
          return {
            id: device.id,
            name: device.name,
            active: device.isActive(),
            powerState: await device.getPowerState(),
          };
        }),
      ),
    };
  }
}

interface GetDevicesResponse {
  devices: GetDevicesResponseDevice[];
}

interface GetDevicesResponseDevice {
  id: string;
  name: string;
  active: boolean;
  powerState: PowerState;
}
