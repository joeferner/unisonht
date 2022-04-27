import { UnisonHTServer } from "..";
import { IrTxRxConfig } from "../types/Config";
import { IrTxRx, IrTxRxFactory } from "../types/IrTxRx";
import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { OpenApi } from "../types/openApi/v3/OpenApi";
import express from "express";
import Debug from "debug";
import { ButtonEvent } from "../types/events/ButtonEvent";
import { setStatusCodeOnError } from "../types/ErrorWithStatusCode";
import { StatusCodes } from "http-status-codes";

export class MockIrTxRxFactory implements IrTxRxFactory {
  get id(): string {
    return "unisonht:mock-ir-tx-rx";
  }

  async createIrTxRx(
    server: UnisonHTServer,
    config: IrTxRxConfig
  ): Promise<IrTxRx> {
    return new MockIrTxRx(server, config);
  }
}

export class MockIrTxRx extends IrTxRx {
  private readonly debug = Debug("unisonht:unisonht:mockIrTxRx");
  private readonly router: express.Router;

  constructor(
    private readonly server: UnisonHTServer,
    private readonly config: IrTxRxConfig
  ) {
    super();

    this.router = express.Router();
    this.router.post("/api/v1/ir/rx", async (req, res) => {
      if (!req.query.button) {
        throw setStatusCodeOnError(
          new Error("'button' is required"),
          StatusCodes.BAD_REQUEST
        );
      }
      await this.handleWebRequestRx(req.query.button.toString());
      res.json({});
    });
  }

  private async handleWebRequestRx(button: string): Promise<void> {
    if (!this.irTxRxConfig.buttons.includes(button)) {
      throw setStatusCodeOnError(
        new Error(`Invalid button "${button}"`),
        StatusCodes.NOT_FOUND
      );
    }

    this.debug("RX button: %s", button);
    const event: ButtonEvent = {
      type: "button",
      button,
    };
  }

  override updateSwaggerJson(swaggerJson: OpenApi): Promise<void> {
    swaggerJson.paths["/api/v1/ir/rx"] = {
      post: {
        operationId: "irRx",
        tags: ["ir"],
        parameters: [
          {
            in: "query",
            name: "button",
            required: true,
            schema: {
              type: "string",
              enum: this.irTxRxConfig.buttons,
            },
          },
        ],
        responses: {
          [200]: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
        },
      },
    };
    return Promise.resolve();
  }

  override handleWebRequest(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>, number>,
    next: NextFunction
  ): void {
    this.router(req, res, next);
  }

  private get irTxRxConfig(): MockIrTxRxConfig {
    return this.config.data as MockIrTxRxConfig;
  }
}

export interface MockIrTxRxConfig {
  buttons: string[];
}
