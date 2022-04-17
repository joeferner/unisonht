import { UnisonHTDeviceConfig } from "../../types/UnisonHTConfig";
import {
  CreateNodeOptions,
  UnisonHTDeviceFactory,
} from "../../types/UnisonHTDeviceFactory";
import { UnisonHTDevice } from "../../types/UnisonHTDevice";
import { WebInterfaceDevice } from "./WebInterfaceDevice";

export class WebInterfaceDeviceFactory implements UnisonHTDeviceFactory {
  get id(): string {
    return "unisonht:web-interface";
  }

  async createDevice(
    config: UnisonHTDeviceConfig,
    options: CreateNodeOptions
  ): Promise<UnisonHTDevice> {
    return new WebInterfaceDevice(options.server, config);
  }
}
