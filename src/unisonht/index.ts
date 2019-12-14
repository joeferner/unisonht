import { UnisonHTButtonRequest, UnisonHTRequest } from './UnisonHTRequest';

export * from './Device';
export * from './DeviceInitOptions';
export * from './DeviceStatus';
export * from './Mode';
export * from './ModeInitOptions';
export * from './UnisonHTRequest';

export type RequestCallback = (req: UnisonHTRequest, next: (err?: Error) => void) => Promise<any>;
export type ButtonPressRequestCallback = (req: UnisonHTButtonRequest, next: (err?: Error) => void) => Promise<any>;
