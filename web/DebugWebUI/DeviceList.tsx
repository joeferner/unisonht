import * as React from "react";
import {Component} from "react";
import {DeviceListResponse, DeviceListResponseDevice} from "../../src/plugins/DevicesList";

export interface DeviceListProps {
    onDeviceClick: (device: DeviceListResponseDevice) => void;
}

interface DeviceListState {
    devices: DeviceListResponseDevice[];
}

export class DeviceList extends Component<DeviceListProps, DeviceListState> {
    constructor(props: any) {
        super(props);
        this.state = {
            devices: undefined
        };
    }

    public componentDidMount(): void {
        this.refreshDevices();
    }

    public async refreshDevices() {
        const devicesResponse = await fetch('/device');
        const devices = (await devicesResponse.json()) as DeviceListResponse;
        this.setState({
            devices: devices.devices
        });
    }

    public render() {
        const {devices} = this.state;
        if (!devices) {
            return (<div>Loading</div>);
        }

        return (<div>
            <h3>Devices</h3>
            <ul>
                {devices.map((device, idx) => {
                    return (
                        <li key={idx}>
                            <a href={`#device/${device.deviceName}`}
                               onClick={() => this.handleDeviceClick(device)}>{device.deviceName}</a>
                        </li>);
                })}
            </ul>
        </div>);
    }

    private handleDeviceClick(device: DeviceListResponseDevice): boolean {
        this.props.onDeviceClick(device);
        return false;
    }
}

