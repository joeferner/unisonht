import Debug from "debug";
import { UnisonHTServer } from "../UnisonHTServer";
import { ActionConfig } from "./Config";

export interface ActionFactory {
  get type(): string;

  createAction(server: UnisonHTServer, config: ActionConfig): Action;
}

export abstract class Action {
  protected readonly debug = Debug(
    `unisonht:unisonht:action:${this.config.type}`
  );

  constructor(
    protected readonly server: UnisonHTServer,
    protected readonly config: ActionConfig
  ) {}

  abstract execute(buttonName: string): Promise<void>;
}
