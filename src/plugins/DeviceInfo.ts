import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { DeviceStatusResponse, DeviceStatusResponseButtons, UnisonHT } from '../UnisonHT';
import { UnisonHTDevice } from '../UnisonHTDevice';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';

export class DeviceInfo implements UnisonHTPlugin {
    public async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.on('deviceAdded', ({ device }) => {
            this.handleDeviceAdded(unisonht, device);
        });
    }

    private handleDeviceAdded(unisonht: UnisonHT, device: UnisonHTDevice) {
        unisonht.get(device, `/device/${device.getDeviceName()}`, {
            handler: this.handleDeviceInfo.bind(this, unisonht, device),
        });
    }

    private async handleDeviceInfo(
        unisonht: UnisonHT,
        device: UnisonHTDevice,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
    ): Promise<void> {
        let status;
        try {
            status = await device.getStatus();
        } catch (err) {
            console.error(`Could not get device "${device.getDeviceName()}" status`, err);
            status = {
                error: err.message,
            };
        }
        const handlers = unisonht.handlers
            .filter((handler) => handler.plugin === device)
            .map((handler) => {
                return {
                    method: handler.method,
                    path: handler.path,
                };
            });
        const buttons: DeviceStatusResponseButtons = {};
        const deviceButtons = device.getSupportedButtons();
        Object.keys(deviceButtons).forEach((button) => {
            const b = deviceButtons[button];
            buttons[button] = {
                name: b.name,
                description: b.description,
            };
        });
        const statusResponse: DeviceStatusResponse = {
            type: device.constructor.name,
            handlers,
            buttons,
            ...status,
        };
        await response.send(statusResponse);
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }
}
