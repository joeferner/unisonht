import asyncHandler from 'express-async-handler';
import { Router } from 'express-serve-static-core';
import { Get, Route } from 'tsoa';
import { PowerState } from '../types/Device';
import { UnisonHTServer } from '../UnisonHTServer';

@Route('api/v1/devices')
export class DevicesController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const devicesController = new DevicesController(server);

    router.get(
      '/api/v1/devices',
      asyncHandler(async (_req, res) => {
        res.send(await devicesController.getDevices());
      }),
    );
  }

  @Get('/')
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
