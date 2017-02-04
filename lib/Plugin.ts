import {UnisonHT} from "../";

export class Plugin {
  private pathPrefix: string;

  constructor(pathPrefix: string) {
    this.pathPrefix = pathPrefix;
  }

  start(unisonht: UnisonHT): Promise<void> {
    return Promise.resolve();
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }

  getPathPrefix(): string {
    return this.pathPrefix;
  }

  toString(): string {
    return this.pathPrefix;
  }
}