import { IUnisonHTPlugin, PluginOptions } from "../types/IUnisonHTPlugin";
import { UnisonHTNodeConfig } from "../types/UnisonHTConfig";
import { UnisonHTNode } from "../types/UnisonHTNode";
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
  private readonly config: UnisonHTNodeConfig;

  constructor(config: UnisonHTNodeConfig) {
    this.debug = Debug(`unisonht:DebugNode:${config.id}`);
    this.config = config;
  }

  get id(): string {
    return this.config.id;
  }

  async handleMessage?(inputName: string, value: any): Promise<void> {
    this.debug("%s: %o", inputName, value);
  }
}
