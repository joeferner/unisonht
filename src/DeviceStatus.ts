export interface DeviceStatus {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export enum PowerStatus {
    ON = 'on',
    OFF = 'off',
    STANDBY = 'standby',
    UNKNOWN = 'unknown',
}

export interface DeviceStatusWithPower extends DeviceStatus {
    power: PowerStatus;
}

export interface DeviceStatusWithVolume extends DeviceStatus {
    volume: number;
    mute: boolean;
}

export interface DeviceStatusWithInput extends DeviceStatus {
    input: string;
}
