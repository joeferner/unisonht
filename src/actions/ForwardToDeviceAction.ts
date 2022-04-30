import { Action, ActionFactory } from '../types/Action';
import { ActionConfig } from '../types/Config';
import { UnisonHTServer } from '../UnisonHTServer';

export class ForwardToDeviceActionFactory implements ActionFactory<ForwardToDeviceActionConfig> {
  get type(): string {
    return 'forwardToDevice';
  }

  createAction(server: UnisonHTServer, config: ForwardToDeviceActionConfig): Action<ForwardToDeviceActionConfig> {
    return new ForwardToDeviceAction(server, config);
  }
}

export class ForwardToDeviceAction extends Action<ForwardToDeviceActionConfig> {
  constructor(server: UnisonHTServer, config: ForwardToDeviceActionConfig) {
    super(server, config);

    if (!server.config.devices.find((d) => d.id === this.config.deviceId)) {
      throw new Error(`Could not find device: ${this.config.deviceId}`);
    }
  }

  execute(buttonName: string): Promise<void> {
    const device = this.server.devices.find((d) => d.id === this.config.deviceId);
    if (this.debug.enabled) {
      this.debug(
        'action: forwarding button "%s" to device %s%s',
        buttonName,
        this.config.deviceId,
        device ? ` (${device.name})` : 'NOT FOUND',
      );
    }

    if (!device) {
      throw new Error(`could not find device: ${this.config.deviceId}`);
    }
    return device.handleButtonPress(buttonName);
  }
}

export interface ForwardToDeviceActionConfig extends ActionConfig {
  type: 'forwardToDevice';
  deviceId: string;
}
