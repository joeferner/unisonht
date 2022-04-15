import { IUnisonHTPlugin, PluginOptions } from "../types/IUnisonHTPlugin";
import { UnisonHTNodeConfig } from "../types/UnisonHTConfig";
import { NodeOptions, UnisonHTNode } from "../types/UnisonHTNode";
import Debug from "debug";

export class DebugPlugin implements IUnisonHTPlugin {
  get id(): string {
    return "unisonht:debug";
  }

  async createNode(
    config: UnisonHTNodeConfig,
    options: PluginOptions
  ): Promise<UnisonHTNode> {
    return new DebugNode(config);
  }
}

export class DebugNode implements UnisonHTNode {
  private readonly debug: Debug.Debugger;

  constructor(private readonly _config: UnisonHTNodeConfig) {
    this.debug = Debug(`unisonht:DebugNode:${this.config.id}`);
  }

  get id(): string {
    return this.config.id;
  }

  get config(): UnisonHTNodeConfig {
    return this._config;
  }

  async handleMessage?(inputName: string, value: any): Promise<void> {
    this.debug("%s: %o", inputName, value);
  }
}
