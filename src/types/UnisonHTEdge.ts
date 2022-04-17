import { UnisonHTEdgeConfig } from "./UnisonHTConfig";

export class UnisonHTEdge {
  constructor(private readonly _config: UnisonHTEdgeConfig) {}

  get config(): UnisonHTEdgeConfig {
    return this._config;
  }
}
