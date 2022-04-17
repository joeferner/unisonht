import {
  UnisonHTNodeFactory,
  CreateNodeOptions,
} from "../types/UnisonHTNodeFactory";
import { UnisonHTNodeConfig } from "../types/UnisonHTConfig";
import {
  NodeInput,
  NodeOptions,
  NodeOutput,
  UnisonHTNode,
} from "../types/UnisonHTNode";
import Debug from "debug";

export class DebugNodeFactory implements UnisonHTNodeFactory {
  get id(): string {
    return "unisonht:debug";
  }

  async createNode(
    config: UnisonHTNodeConfig,
    options: CreateNodeOptions
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

  get name(): string {
    return (
      this.config.name ??
      this.config.deviceId ??
      this.config.nodeFactoryId ??
      this.config.id
    );
  }

  get inputs(): NodeInput[] {
    return [{ name: "ALL" }];
  }

  get outputs(): NodeOutput[] {
    return [];
  }

  async handleMessage?(inputName: string, value: any): Promise<void> {
    this.debug("%s: %o", inputName, value);
  }
}
