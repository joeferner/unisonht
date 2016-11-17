import UnisonHT from "../index";

export interface InputOptions {

}

export class Input {
  constructor(options: InputOptions) {

  }

  start(unisonHT: UnisonHT): Promise<void> {
    return Promise.resolve();
  }

  stop(unisonHT: UnisonHT): Promise<void> {
    return Promise.resolve();
  }
}

