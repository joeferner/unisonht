import { Device } from './Device';
import { ModeInitOptions } from './ModeInitOptions';
import { UnisonHT } from './UnisonHT';
import Debug from 'debug';

const debug = Debug('unisonht/mode');

export interface Mode {
  readonly name: string;

  readonly devices: Device[];

  init(initOptions: ModeInitOptions): Promise<void>;

  buttonPress(app: UnisonHT, button: string): Promise<boolean>;

  onEnter?(app: UnisonHT): Promise<void>;

  onExit?(app: UnisonHT): Promise<void>;
}

export interface StandardModeOptions {
  name: string;
  devices: Device[];
  buttons?: {
    [action: string]: (app: UnisonHT) => Promise<boolean>;
  };
}

export interface GenericModeOptions extends StandardModeOptions {
  onEnter?: (app: UnisonHT) => Promise<void>;
  onExit?: (app: UnisonHT) => Promise<void>;
}

export class GenericMode implements Mode {
  private options: GenericModeOptions;

  constructor(options: GenericModeOptions) {
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

  async buttonPress(app: UnisonHT, button: string): Promise<boolean> {
    debug(`buttonPress(button: ${button})`);
    if (this.options.buttons && this.options.buttons[button]) {
      const btn = this.options.buttons[button];
      return await btn(app);
    }
    return false;
  }

  async onEnter(app: UnisonHT): Promise<void> {
    if (this.options.onEnter) {
      await this.options.onEnter(app);
    }
  }

  async onExit(app: UnisonHT): Promise<void> {
    if (this.options.onExit) {
      await this.options.onExit(app);
    }
  }
}

export function getModeUrlPrefix(mode: Mode): string {
  return `/mode/${encodeURIComponent(mode.name)}`;
}
