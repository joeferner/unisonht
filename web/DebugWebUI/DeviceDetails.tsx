import * as React from "react";
import {Component} from "react";
import {DeviceListResponseDevice} from "../../src/plugins/DevicesList";
import {DeviceButtons} from "./DeviceButtons";

export interface DeviceDetailsProps {
    device: DeviceListResponseDevice;
}

interface DeviceDetailsState {
    deviceStatus: {
        handlers: {
            method: string,
            path: string
        }[],
        buttons: {
            [button: string]: {
                name: string;
            }
        }
    };
}

export class DeviceDetails extends Component<DeviceDetailsProps, DeviceDetailsState> {
    constructor(props: any) {
        super(props);
        this.state = {
            deviceStatus: undefined
        };
    }

    public componentDidMount(): void {
        this.refreshDevice();
    }

    public componentDidUpdate(
        prevProps: Readonly<DeviceDetailsProps>,
        prevState: Readonly<DeviceDetailsState>,
        snapshot?: any
    ): void {
        if (
            prevProps.device
            && this.props.device
            && prevProps.device.deviceName !== this.props.device.deviceName
        ) {
            this.refreshDevice();
        }
    }

    public async refreshDevice() {
        const {device} = this.props;
        const deviceStatusResponse = await fetch(`/device/${device.deviceName}`);
        const deviceStatus = await deviceStatusResponse.json();
        this.setState({
            deviceStatus
        });
    }

    public render() {
        const {device} = this.props;
        const {deviceStatus} = this.state;
        if (!deviceStatus) {
            return (<div>Loading</div>);
        }

        return (<div>
            <DeviceButtons buttons={deviceStatus.buttons} onButtonClick={(button) => this.handleButtonPress(button)}/>
            <pre>{JSON.stringify(device, null, 2)}</pre>
            <pre>{JSON.stringify(deviceStatus, null, 2)}</pre>
        </div>);
    }

    private async handleButtonPress(buttonKey: string) {
        const {device} = this.props;
        const {deviceStatus} = this.state;
        const button = deviceStatus.buttons[buttonKey];
        await fetch(`/device/${device.deviceName}/button/${buttonKey}`, {
            method: 'POST'
        })
    }
}

