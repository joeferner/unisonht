import { UnisonHTRequest } from './UnisonHTRequest';

export * from './Device';
export * from './DeviceInitOptions';
export * from './DeviceStatus';
export * from './Mode';
export * from './ModeInitOptions';
export * from './UnisonHT';
export * from './UnisonHTRequest';

export type RequestCallback = (req: UnisonHTRequest, next: (err?: Error) => void) => Promise<any>;

export function sleep(time: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, time);
  });
}
