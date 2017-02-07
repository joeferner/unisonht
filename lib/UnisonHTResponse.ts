import * as express from "express";

export interface UnisonHTResponse extends express.Response {
  deviceButtonPress: (deviceName: string, buttonName: string) => void;
  changeMode: (newMode: string) => void;
  promiseNoContent: (promise: Promise<any>) => void;
}
