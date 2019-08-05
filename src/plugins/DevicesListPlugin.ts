import {UnisonHTPlugin} from "../UnisonHTPlugin";
import {UnisonHT} from "../UnisonHT";
import {RouteHandlerRequest} from "../RouteHandlerRequest";

export interface DeviceListResponseDevice {
    deviceName: string;
    type: string;
}

export interface DeviceListResponse {
    devices: DeviceListResponseDevice[];
}

export class DevicesListPlugin implements UnisonHTPlugin {
    async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.get(this, '/device', {
            handler: this.list.bind(this)
        });
    }

    private async list(request: RouteHandlerRequest): Promise<void> {
        request.resolve({
            devices: request.unisonht.getDevices()
                .map((device) => {
                    return {
                        deviceName: device.getDeviceName(),
                        type: device.constructor.name
                    };
                })
        });
    }

    async handleKeyPress(key: string, request: RouteHandlerRequest): Promise<void> {
        await request.next(request);
    }
}
