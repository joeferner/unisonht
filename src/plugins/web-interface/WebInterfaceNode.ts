import { createCheckers } from "ts-interface-checker";
import WebInterfaceDeviceFactoryNodeDataTypeInfo from "../../../dist/WebInterfaceTypes-ti";
import { ButtonEvent } from "../../types/events/ButtonEvent";
import { UnisonHTNodeConfig } from "../../types/UnisonHTConfig";
import { NodeInput, NodeOutput, UnisonHTNode } from "../../types/UnisonHTNode";
import { UnisonHTServer } from "../../UnisonHTServer";
import { WebInterfaceDevice } from "./WebInterfaceDevice";
import { WebInterfaceNodeData } from "./WebInterfaceTypes";

export class WebInterfaceNode implements UnisonHTNode {
  constructor(
    private readonly server: UnisonHTServer,
    private readonly device: WebInterfaceDevice,
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

  get name(): string {
    return this.config.name ?? this.device.name;
  }

  get config(): UnisonHTNodeConfig {
    return this._config;
  }

  get configData(): WebInterfaceNodeData {
    return this.config.data as WebInterfaceNodeData;
  }

  get inputs(): NodeInput[] {
    return [];
  }

  get outputs(): NodeOutput[] {
    return this.configData.outputs.map((o) => ({
      name: o.name,
    }));
  }

  async handleButtonPress(value: string): Promise<void> {
    for (const output of this.configData.outputs) {
      if (output.values.includes(value)) {
        await this.emitOutput(output.name, value);
      }
    }
  }

  private emitOutput(outputName: string, buttonName: string): Promise<void> {
    const event: ButtonEvent = { buttonName };
    return this.server.emitMessage(this, outputName, event);
  }
}
