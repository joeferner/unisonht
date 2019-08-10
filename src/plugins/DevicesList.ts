import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { NextFunction, UnisonHT } from '../UnisonHT';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';

export interface DeviceListResponseDevice {
  deviceName: string;
  type: string;
}

export interface DeviceListResponse {
  devices: DeviceListResponseDevice[];
}

export class DevicesList implements UnisonHTPlugin {
  public async initialize(unisonht: UnisonHT): Promise<void> {
    unisonht.get(this, '/device', {
      handler: this.list.bind(this),
    });
  }

  private async list(request: RouteHandlerRequest, response: RouteHandlerResponse, next: NextFunction): Promise<void> {
    response.send({
      devices: request.unisonht.getDevices().map(device => {
        return {
          deviceName: device.getDeviceName(),
          type: device.constructor.name,
        };
      }),
    });
  }

  public getSupportedButtons(): SupportedButtons {
    return {};
  }
}
