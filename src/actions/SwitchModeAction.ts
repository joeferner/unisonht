import { Action, ActionFactory } from "../types/Action";
import { ActionConfig } from "../types/Config";
import { UnisonHTServer } from "../UnisonHTServer";

export class SwitchModeActionFactory implements ActionFactory {
  get type(): string {
    return "switchMode";
  }

  createAction(server: UnisonHTServer, config: ActionConfig): Action {
    return new SwitchModeAction(server, config);
  }
}

export class SwitchModeAction extends Action {
  constructor(server: UnisonHTServer, config: ActionConfig) {
    super(server, config);

    if (!server.config.modes.find((m) => m.id === this.myConfig.modeId)) {
      throw new Error(`Could not find mode: ${this.myConfig.modeId}`);
    }
  }

  execute(_buttonName: string): Promise<void> {
    this.debug("action: switching mode to %s", this.myConfig.modeId);
    return this.server.switchMode(
      this.myConfig.modeId,
      this.myConfig.deviceInputs
    );
  }

  private get myConfig(): SwitchModeActionConfig {
    return this.config as SwitchModeActionConfig;
  }
}

export interface SwitchModeActionConfig extends ActionConfig {
  type: "switchMode";
  modeId: string;
  deviceInputs?: { [deviceId: string]: string };
}
