import {
  UnisonHTNodeFactory,
  CreateNodeOptions,
} from "../types/UnisonHTNodeFactory";
import { UnisonHTNodeConfig } from "../types/UnisonHTConfig";
import { NodeInput, NodeOutput, UnisonHTNode } from "../types/UnisonHTNode";
import { UnisonHTServer } from "../UnisonHTServer";
import ModeSwitchConfigDataTypeInfo from "../../dist/ModeSwitchNodeFactory-ti";
import { createCheckers } from "ts-interface-checker";

export class ModeSwitchNodeFactory implements UnisonHTNodeFactory {
  get id(): string {
    return "unisonht:modeSwitch";
  }

  async createNode(
    config: UnisonHTNodeConfig,
    options: CreateNodeOptions
  ): Promise<UnisonHTNode> {
    return new ModeSwitchNode(config, options.server);
  }
}

export class ModeSwitchNode implements UnisonHTNode {
  constructor(
    private readonly _config: UnisonHTNodeConfig,
    private readonly server: UnisonHTServer
  ) {
    const typeCheckers = createCheckers(ModeSwitchConfigDataTypeInfo);
    typeCheckers.ModeSwitchConfigData.check(_config.data);
  }

  get id(): string {
    return this.config.id;
  }

  get config(): UnisonHTNodeConfig {
    return this._config;
  }

  get name(): string {
    return this.config.name ?? `Switch Mode: ${this.configData.mode}`;
  }

  get inputs(): NodeInput[] {
    return [
      {
        name: "SET",
      },
    ];
  }

  get outputs(): NodeOutput[] {
    return [];
  }

  private get configData(): ModeSwitchConfigData {
    return this.config.data as ModeSwitchConfigData;
  }

  handleMessage?(inputName: string, value: any): Promise<void> {
    return this.server.switchMode(this.configData.mode);
  }
}

export interface ModeSwitchConfigData {
  mode: string;
}
