import { UnisonHTDevice } from '../UnisonHTDevice';
import { UnisonHT } from '../UnisonHT';
import { DeviceStatus } from '../DeviceStatus';
import { SupportedButtons } from '../UnisonHTPlugin';

export class ExampleDevice implements UnisonHTDevice {
    public getDeviceName(): string {
        return 'example';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async initialize(unisonht: UnisonHT): Promise<void> {
        // do nothing
    }

    public async getStatus(): Promise<DeviceStatus> {
        return {};
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }
}
