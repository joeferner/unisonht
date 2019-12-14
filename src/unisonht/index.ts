import { UnisonHTButtonRequest, UnisonHTRequest } from './UnisonHTRequest';
import { UnisonHTResponse } from './UnisonHTResponse';

export * from './Device';
export * from './DeviceInitOptions';
export * from './DeviceStatus';
export * from './UnisonHTRequest';
export * from './UnisonHTResponse';

export type RequestCallback = (req: UnisonHTRequest, res: UnisonHTResponse, next: (err?: Error) => void) => Promise<any>;
export type ButtonPressRequestCallback = (req: UnisonHTButtonRequest, res: UnisonHTResponse, next: (err?: Error) => void) => Promise<any>;
