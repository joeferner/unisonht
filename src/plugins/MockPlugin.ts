import { UnisonHTServer } from "..";
import { PluginConfig } from "../types/Config";
import { Plugin, PluginFactory } from "../types/Plugin";
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

export class MockPluginFactory implements PluginFactory {
  get id(): string {
    return "unisonht:mock-ir-tx-rx";
  }

  async createPlugin(
    server: UnisonHTServer,
    config: PluginConfig
  ): Promise<Plugin> {
    return new MockPlugin(server, config);
  }
}

export class MockPlugin extends Plugin {
  constructor(server: UnisonHTServer, config: PluginConfig) {
    super(server, config);

    this.router.post(`${this.urlPrefix}/rx`, async (req, res) => {
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
    swaggerJson.paths[`${this.urlPrefix}/rx`] = {
      post: {
        operationId: "irRx",
        tags: ["Plugin: IR Rx"],
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
