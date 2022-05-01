import { Router } from 'express-serve-static-core';
import { OPENAPI_UNISONHT_CORE_TAGS } from '.';
import { PowerState } from '../types/Device';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { UnisonHTServer } from '../UnisonHTServer';

const ROUTE_DEVICES = '/api/v1/devices';
export class DevicesController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const devicesController = new DevicesController(server);

    router.get(ROUTE_DEVICES, async (_req, res) => {
      res.send(await devicesController.getDevices());
    });
  }

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

  static updateOpenApi(server: UnisonHTServer, openApi: OpenApi) {
    const deviceIds = server.devices.map((d) => d.id);
    openApi.paths[ROUTE_DEVICES] = {
      get: {
        operationId: 'getDevices',
        tags: OPENAPI_UNISONHT_CORE_TAGS,
        responses: {
          [200]: {
            description: 'list of devices',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        enum: deviceIds,
                      },
                      name: {
                        type: 'string',
                      },
                      active: {
                        type: 'boolean',
                      },
                      powerState: {
                        type: 'string',
                        enum: [PowerState.ON, PowerState.OFF],
                      },
                    },
                    required: ['id', 'name', 'active', 'powerState'],
                  },
                },
              },
            },
          },
        },
      },
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
