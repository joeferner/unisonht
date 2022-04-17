import { createCheckers } from "ts-interface-checker";
import WebInterfaceDeviceFactoryNodeDataTypeInfo from "../../../dist/WebInterfaceTypes-ti";
import { UnisonHTNodeConfig } from "../../types/UnisonHTConfig";
import { NodeInput, NodeOutput, UnisonHTNode } from "../../types/UnisonHTNode";
import { UnisonHTServer } from "../../UnisonHTServer";
import { WebInterfaceNodeData } from "./WebInterfaceTypes";

export class WebInterfaceNode implements UnisonHTNode {
  constructor(
    private readonly server: UnisonHTServer,
    private readonly _config: UnisonHTNodeConfig
  ) {
    const typeCheckers = createCheckers(
      WebInterfaceDeviceFactoryNodeDataTypeInfo
    );
    typeCheckers.WebInterfaceNodeData.check(_config.data);
  }

  get id(): string {
    return this.config.id;
  }

  get config(): UnisonHTNodeConfig {
    return this._config;
  }

  get inputs(): NodeInput[] {
    throw new Error("todo");
  }

  get outputs(): NodeOutput[] {
    throw new Error("todo");
  }

  get configData(): WebInterfaceNodeData {
    return this.config.data as WebInterfaceNodeData;
  }

  async handleButtonPress(value: string): Promise<void> {
    for (const output of this.configData.outputs) {
      if (output.values.includes(value)) {
        await this.emitOutput(output.name, value);
      }
    }
  }

  private emitOutput(name: string, value: string): Promise<void> {
    return this.server.emitMessage(this, name, { value });
  }
}
