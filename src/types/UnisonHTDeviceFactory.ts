import { UnisonHTServer } from "../UnisonHTServer";
import { UnisonHTDeviceConfig } from "./UnisonHTConfig";
import { UnisonHTDevice } from "./UnisonHTDevice";

export interface UnisonHTDeviceFactory {
  get id(): string;

  createDevice(
    server: UnisonHTServer,
    config: UnisonHTDeviceConfig
  ): Promise<UnisonHTDevice>;
}
