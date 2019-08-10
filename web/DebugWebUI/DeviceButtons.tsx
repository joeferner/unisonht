import * as React from "react";
import {Component} from "react";

export interface DeviceButtonsProps {
    buttons: {
        [button: string]: {
            name: string;
        }
    },
    onButtonClick: (button: string) => void;
}

export class DeviceButtons extends Component<DeviceButtonsProps, any> {
    public render() {
        const {buttons} = this.props;

        return (<div>
            <h4>Buttons</h4>
            <ul>
                {Object.keys(buttons).map((buttonKey, index) => {
                    const button = buttons[buttonKey];
                    return (<li key={index}>
                        <a href='#' onClick={() => this.handleButtonClick(buttonKey)}>{button.name}</a>
                    </li>);
                })}
            </ul>
        </div>);
    }

    private handleButtonClick(button: string): boolean {
        this.props.onButtonClick(button);
        return false;
    }
}

