import { UnisonHTServer } from "../UnisonHTServer";
import { UnisonHTConfig, UnisonHTDeviceConfig } from "./UnisonHTConfig";
import { UnisonHTDevice } from "./UnisonHTDevice";

export interface UnisonHTDeviceFactory {
  get id(): string;

  createDevice(
    config: UnisonHTDeviceConfig,
    options: CreateNodeOptions
  ): Promise<UnisonHTDevice>;
}

export interface CreateNodeOptions {
  server: UnisonHTServer;
  config: UnisonHTConfig;
}
