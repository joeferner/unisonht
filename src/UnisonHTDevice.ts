import { UnisonHTPlugin } from './UnisonHTPlugin';
import { DeviceStatus } from './DeviceStatus';

export interface UnisonHTDevice extends UnisonHTPlugin {
    getDeviceName(): string;

    getStatus(): Promise<DeviceStatus>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function instanceOfUnisonHTDevice(obj: any): obj is UnisonHTDevice {
    return 'getDeviceName' in obj && 'getStatus' in obj;
}
