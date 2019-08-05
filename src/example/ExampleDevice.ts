import {UnisonHTDevice} from "../UnisonHTDevice";
import {UnisonHT} from "../UnisonHT";
import {DeviceStatus} from "../DeviceStatus";
import {RouteHandlerRequest} from "../RouteHandlerRequest";

export class ExampleDevice implements UnisonHTDevice {
    getDeviceName(): string {
        return "example";
    }

    async initialize(unisonht: UnisonHT): Promise<void> {
    }

    async getStatus(): Promise<DeviceStatus> {
        return {};
    }

    async handleKeyPress(key: string, request: RouteHandlerRequest): Promise<void> {
        request.next(request);
    }
}
