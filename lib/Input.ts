import * as Logger from "bunyan";
import {Plugin} from "./Plugin";
import {UnisonHT} from "./UnisonHT";
import {createLogger} from "./Log";

export class Input extends Plugin {
  private inputName: string;
  private options: Input.Options;
  protected log: Logger;

  constructor(inputName: string, options: Input.Options) {
    super(`/input/${inputName}`);
    this.log = createLogger(`UnisonHT.Input[${inputName}]`);
    this.inputName = inputName;
    this.options = options;
  }

  start(unisonht: UnisonHT): Promise<void> {
    return super.start(unisonht);
  }

  protected getOptions(): Input.Options {
    return this.options;
  }

  public getInputName(): string {
    return this.inputName;
  }
}

export module Input {
  export interface Options {
  }
}
