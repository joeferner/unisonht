import { UnisonHTPlugin } from './UnisonHTPlugin';

export interface UnisonHTMode extends UnisonHTPlugin {
  getModeName(): string;

  enter?(): Promise<void>;

  exit?(): Promise<void>;
}

export function instanceOfUnisonHTMode(obj: any): obj is UnisonHTMode {
  return 'getModeName' in obj;
}
