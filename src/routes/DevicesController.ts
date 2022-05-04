import { Router } from 'express-serve-static-core';
import { getType, Type } from 'tst-reflect';
import { OPENAPI_UNISONHT_CORE_TAGS } from '.';
import { PowerState } from '../types/Device';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { Get } from '../types/openApiDecorators';
import { OpenApiProvider } from '../types/OpenApiProvider';
import { UnisonHTServer } from '../UnisonHTServer';

const ROUTE_DEVICES = '/api/v1/devices';
export class DevicesController implements OpenApiProvider {
  constructor(private readonly server: UnisonHTServer, router: Router) {
    router.get(ROUTE_DEVICES, async (_req, res) => {
      res.send(await this.getDevices());
    });
  }

  get openApiTags(): string[] {
    return OPENAPI_UNISONHT_CORE_TAGS;
  }

  get apiUrlPrefix(): string {
    return ROUTE_DEVICES;
  }

  getOpenApiType(): Type | undefined {
    return getType<DevicesController>();
  }

  @Get('`${this.apiUrlPrefix}`')
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

  updateOpenApi(openApi: OpenApi): void {}
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
