import { UnisonHT } from './UnisonHT';
import { IncomingMessage } from 'http';

export enum Method {
  ERROR = 'ERROR',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface UnisonHTRequest {
  method: Method;
  url: string;
  path: string;
  app: UnisonHT;
  http?: IncomingMessage;
  parameters: { [key: string]: string };
}
