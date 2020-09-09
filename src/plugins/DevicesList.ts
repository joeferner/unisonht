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

    private async list(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<void> {
        const result: DeviceListResponse = {
            devices: request.unisonht.getDevices().map((device) => {
                return {
                    deviceName: device.getDeviceName(),
                    type: device.constructor.name,
                };
            }),
        };
        response.send(result);
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }
}
