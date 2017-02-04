import * as HttpStatusCodes from "http-status-codes";
import * as express from "express";

export interface PromiseResponderResponse extends express.Response {
  promiseNoContent: (promise: Promise<any>) => void;
}

export function promiseResponder(req: express.Request, res: express.Response, next: express.NextFunction) {
  (<PromiseResponderResponse>res).promiseNoContent = function (promise: Promise<any>) {
    promise
      .then(() => {
        res.status(HttpStatusCodes.NO_CONTENT).send();
      })
      .catch(next);
  };
}
