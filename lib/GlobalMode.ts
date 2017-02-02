import {Mode} from "./Mode";

export class GlobalMode extends Mode {
  constructor(options: Mode.Options) {
    super(':global', options);
  }

  canEnter() {
    return false;
  }
}
