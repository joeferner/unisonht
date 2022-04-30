import Debug from 'debug';
import { UnisonHTServer } from '../UnisonHTServer';
import { ActionConfig } from './Config';

export interface ActionFactory<TConfig extends ActionConfig> {
  get type(): string;

  createAction(server: UnisonHTServer, config: TConfig): Action<TConfig>;
}

export abstract class Action<TConfig extends ActionConfig> {
  protected readonly debug = Debug(`unisonht:unisonht:action:${this.config.type}`);

  constructor(protected readonly server: UnisonHTServer, protected readonly config: TConfig) {}

  abstract execute(buttonName: string): Promise<void>;
}
