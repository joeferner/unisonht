import {UnisonHTDevice} from "../UnisonHTDevice";
import {NextFunction, UnisonHT} from "../UnisonHT";
import {DeviceStatus} from "../DeviceStatus";
import {RouteHandlerRequest} from "../RouteHandlerRequest";
import {RouteHandlerResponse} from "../RouteHandlerResponse";

export class ExampleDevice implements UnisonHTDevice {
    getDeviceName(): string {
        return "example";
    }

    async initialize(unisonht: UnisonHT): Promise<void> {
    }

    async getStatus(): Promise<DeviceStatus> {
        return {};
    }

    async handleKeyPress(
        key: string,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction
    ): Promise<void> {
        console.log(`key press: ${key}`);
        next();
    }
}
