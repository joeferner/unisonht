import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "..";
import { PluginConfig } from "../types/Config";
import { setStatusCodeOnError } from "../types/ErrorWithStatusCode";
import { OpenApi } from "../types/openApi/v3/OpenApi";
import { Plugin, PluginFactory } from "../types/Plugin";
import asyncHandler from "express-async-handler";

export class WebRemotePluginFactory implements PluginFactory {
  get id(): string {
    return "unisonht:web-remote";
  }

  async createPlugin(
    server: UnisonHTServer,
    config: PluginConfig
  ): Promise<Plugin> {
    return new WebRemotePlugin(server, config);
  }
}

export class WebRemotePlugin extends Plugin {
  constructor(server: UnisonHTServer, config: PluginConfig) {
    super(server, config);

    this.router.post(
      `${this.urlPrefix}/button`,
      asyncHandler(async (req, res) => {
        if (!req.query.button) {
          throw setStatusCodeOnError(
            new Error("'button' is required"),
            StatusCodes.BAD_REQUEST
          );
        }
        await this.handleWebRequestPressButton(req.query.button.toString());
        res.json({});
      })
    );
  }

  private handleWebRequestPressButton(button: string): Promise<void> {
    if (!this.webRemoteConfig.buttons.includes(button)) {
      throw setStatusCodeOnError(
        new Error(`Invalid button "${button}"`),
        StatusCodes.NOT_FOUND
      );
    }

    this.debug("press button: %s", button);
    return this.server.pressButton(button);
  }

  override updateSwaggerJson(swaggerJson: OpenApi): Promise<void> {
    swaggerJson.paths[`${this.urlPrefix}/button`] = {
      post: {
        operationId: "pressButton",
        tags: ["Plugin: Web Remote"],
        parameters: [
          {
            in: "query",
            name: "button",
            required: true,
            schema: {
              type: "string",
              enum: this.webRemoteConfig.buttons,
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
          [404]: {
            description: "Button not found",
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

  private get webRemoteConfig(): WebRemoteConfig {
    return this.config.data as WebRemoteConfig;
  }
}

export interface WebRemoteConfig {
  buttons: string[];
}
