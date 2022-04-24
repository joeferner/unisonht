import { UnisonHTServer } from "../UnisonHTServer";
import { IrTxRxConfig } from "./Config";
import { OpenApi } from "./openApi/v3/OpenApi";
import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";

export interface IrTxRxFactory {
  get id(): string;

  createIrTxRx(server: UnisonHTServer, config: IrTxRxConfig): Promise<IrTxRx>;
}

export abstract class IrTxRx {
  updateSwaggerJson(swaggerJson: OpenApi): Promise<void> {
    return Promise.resolve();
  }

  handleWebRequest(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction
  ): void {
    next();
  }
}
