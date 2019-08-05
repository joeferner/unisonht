import {UnisonHTPlugin} from "./UnisonHTPlugin";
import {DeviceStatus} from "./DeviceStatus";

export interface UnisonHTDevice extends UnisonHTPlugin {
    getDeviceName(): string;

    getStatus(): Promise<DeviceStatus>;
}

export function instanceOfUnisonHTDevice(obj: any): obj is UnisonHTDevice {
    return 'getDeviceName' in obj
        && 'getStatus' in obj;
}
