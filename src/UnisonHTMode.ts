import { UnisonHTPlugin } from './UnisonHTPlugin';

export interface UnisonHTMode extends UnisonHTPlugin {
    getModeName(): string;

    enter?(): Promise<void>;

    exit?(): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function instanceOfUnisonHTMode(obj: any): obj is UnisonHTMode {
    return 'getModeName' in obj;
}
