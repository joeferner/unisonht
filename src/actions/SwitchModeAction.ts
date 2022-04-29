import { Action, ActionFactory } from "../types/Action";
import { ActionConfig } from "../types/Config";
import { UnisonHTServer } from "../UnisonHTServer";

export class SwitchModeActionFactory
  implements ActionFactory<SwitchModeActionConfig>
{
  get type(): string {
    return "switchMode";
  }

  createAction(
    server: UnisonHTServer,
    config: SwitchModeActionConfig
  ): Action<SwitchModeActionConfig> {
    return new SwitchModeAction(server, config);
  }
}

export class SwitchModeAction extends Action<SwitchModeActionConfig> {
  constructor(server: UnisonHTServer, config: SwitchModeActionConfig) {
    super(server, config);

    if (!server.config.modes.find((m) => m.id === this.config.modeId)) {
      throw new Error(`Could not find mode: ${this.config.modeId}`);
    }
  }

  execute(_buttonName: string): Promise<void> {
    this.debug("action: switching mode to %s", this.config.modeId);
    return this.server.switchMode(
      this.config.modeId,
      this.config.deviceInputs
    );
  }
}

export interface SwitchModeActionConfig extends ActionConfig {
  type: "switchMode";
  modeId: string;
  deviceInputs?: { [deviceId: string]: string };
}
