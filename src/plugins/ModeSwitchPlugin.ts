import { IUnisonHTPlugin, PluginOptions } from "../types/IUnisonHTPlugin";
import { UnisonHTNodeConfig } from "../types/UnisonHTConfig";
import { UnisonHTNode } from "../types/UnisonHTNode";
import { UnisonHTServer } from "../UnisonHTServer";

export class ModeSwitchPlugin implements IUnisonHTPlugin {
  get id(): string {
    return "unisonht:modeSwitch";
  }

  async createNode(
    config: UnisonHTNodeConfig,
    options: PluginOptions
  ): Promise<UnisonHTNode> {
    return new ModeSwitchNode(config, options.server);
  }
}

export class ModeSwitchNode implements UnisonHTNode {
  constructor(
    private readonly _config: UnisonHTNodeConfig,
    private readonly server: UnisonHTServer
  ) {}

  get id(): string {
    return this.config.id;
  }

  get config(): UnisonHTNodeConfig {
    return this._config;
  }

  private get configData(): ModeSwitchConfigData {
    return this.config.data as ModeSwitchConfigData;
  }

  handleMessage?(inputName: string, value: any): Promise<void> {
    return this.server.switchModes(this.configData.mode);
  }
}

export interface ModeSwitchConfigData {
  mode: string;
}
