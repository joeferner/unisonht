import { Action, ActionFactory } from "../types/Action";
import { ActionConfig } from "../types/Config";
import { UnisonHTServer } from "../UnisonHTServer";

export class ForwardToDeviceActionFactory implements ActionFactory {
  get type(): string {
    return "forwardToDevice";
  }

  createAction(server: UnisonHTServer, config: ActionConfig): Action {
    return new ForwardToDeviceAction(server, config);
  }
}

export class ForwardToDeviceAction extends Action {
  constructor(server: UnisonHTServer, config: ActionConfig) {
    super(server, config);

    if (!server.config.devices.find((d) => d.id === this.myConfig.deviceId)) {
      throw new Error(`Could not find device: ${this.myConfig.deviceId}`);
    }
  }

  execute(buttonName: string): Promise<void> {
    const device = this.server.devices.find(
      (d) => d.id === this.myConfig.deviceId
    );
    if (this.debug.enabled) {
      this.debug(
        'action: forwarding button "%s" to device %s%s',
        buttonName,
        this.myConfig.deviceId,
        device ? ` (${device.name})` : "NOT FOUND"
      );
    }

    if (!device) {
      throw new Error(`could not find device: ${this.myConfig.deviceId}`);
    }
    return device.handleButtonPress(buttonName);
  }

  private get myConfig(): ForwardToDeviceActionConfig {
    return this.config as ForwardToDeviceActionConfig;
  }
}

export interface ForwardToDeviceActionConfig extends ActionConfig {
  type: "forwardToDevice";
  deviceId: string;
}
