import * as React from "react";
import {Component} from "react";
import {DeviceList} from "./DeviceList";
import {DeviceListResponseDevice} from "../../src/plugins/DevicesList";
import {DeviceDetails} from "./DeviceDetails";

interface AppState {
    selectedDevice: DeviceListResponseDevice | undefined;
}

const styles = {
    container: {
        display: 'flex'
    },
    leftPanel: {},
    rightPanel: {}
};

export class App extends Component<any, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedDevice: undefined
        };
    }

    public render() {
        const {selectedDevice} = this.state;

        return (<div style={styles.container}>
            <div style={styles.leftPanel}>
                <DeviceList onDeviceClick={(device) => this.handleDeviceClick(device)}/>
            </div>
            <div style={styles.rightPanel}>
                {selectedDevice ? <DeviceDetails device={selectedDevice}/> : null}
            </div>
        </div>);
    }

    private handleDeviceClick(device: DeviceListResponseDevice) {
        this.setState({
            selectedDevice: device
        })
    }
}

