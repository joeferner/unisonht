import { Device } from './Device';
import { ModeInitOptions } from './ModeInitOptions';
import { UnisonHT } from './UnisonHT';

export interface Mode {
  readonly name: string;

  readonly devices: Device[];

  init(initOptions: ModeInitOptions): Promise<void>;

  onEnter?(app: UnisonHT): Promise<void>;

  onExit?(app: UnisonHT): Promise<void>;
}

export interface StandardModeOptions {
  name: string;
  devices: Device[];
}

export class StandardMode implements Mode {
  private options: StandardModeOptions;

  constructor(options: StandardModeOptions) {
    this.options = options;
  }

  get name(): string {
    return this.options.name;
  }

  get devices(): Device[] {
    return this.options.devices;
  }

  async init(initOptions: ModeInitOptions): Promise<void> {
  }
}
