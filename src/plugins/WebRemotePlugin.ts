import { NextFunction, ParamsDictionary, Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { ParsedQs } from 'qs';
import { UnisonHTServer } from '..';
import { PluginConfig } from '../types/Config';
import { setStatusCodeOnError } from '../types/ErrorWithStatusCode';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { Plugin, PluginFactory } from '../types/Plugin';
import asyncHandler from 'express-async-handler';

export class WebRemotePluginFactory implements PluginFactory<WebRemoteConfig> {
  get id(): string {
    return 'unisonht:web-remote';
  }

  async createPlugin(server: UnisonHTServer, config: PluginConfig<WebRemoteConfig>): Promise<Plugin<WebRemoteConfig>> {
    return new WebRemotePlugin(server, config);
  }
}

export class WebRemotePlugin extends Plugin<WebRemoteConfig> {
  constructor(server: UnisonHTServer, config: PluginConfig<WebRemoteConfig>) {
    super(server, config);

    this.router.post(
      `${this.apiUrlPrefix}/button`,
      asyncHandler(async (req, res) => {
        if (!req.query.button) {
          throw setStatusCodeOnError(new Error("'button' is required"), StatusCodes.BAD_REQUEST);
        }
        await this.handleWebRequestPressButton(req.query.button.toString());
        res.json({});
      }),
    );

    this.router.get(`${this.urlPrefix}`, (_req, res) => {
      res.send(`<html>
        <head>
          <title>UnisonHT: ${this.name}</title>
          <script type="text/javascript">
            function handleButtonClick(buttonName) {
              fetch(
                '${this.apiUrlPrefix}/button?button=' + encodeURIComponent(buttonName),
                {
                  method: 'POST'
                }
              ).then(res => {
                switch (res.status) {
                  case 200:
                    break;
                  case 404:
                    alert("Not Found");
                    break;
                  case 500:
                    alert("Server Error");
                    break;
                  default:
                    console.error(res);
                    alert(res.statusText)
                    break;
                }
              }).catch(err => {
                console.error(err);
                alert(err.message);
              })
            }
          </script>
        </head>
        <body>
          ${this.config.data.buttons
            .map((button) => {
              return `<div><button onclick="handleButtonClick('${button}')">${button}</button></div>`;
            })
            .join('')}
        </body>
      </html>`);
    });
  }

  private handleWebRequestPressButton(button: string): Promise<void> {
    if (!this.config.data.buttons.includes(button)) {
      throw setStatusCodeOnError(new Error(`Invalid button "${button}"`), StatusCodes.NOT_FOUND);
    }

    this.debug('press button: %s', button);
    return this.server.pressButton(button);
  }

  override updateSwaggerJson(swaggerJson: OpenApi): Promise<void> {
    swaggerJson.paths[`${this.apiUrlPrefix}/button`] = {
      post: {
        operationId: 'pressButton',
        tags: ['Plugin: Web Remote'],
        parameters: [
          {
            in: 'query',
            name: 'button',
            required: true,
            schema: {
              type: 'string',
              enum: this.config.data.buttons,
            },
          },
        ],
        responses: {
          [200]: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
          [404]: {
            description: 'Button not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
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
    next: NextFunction,
  ): void {
    this.router(req, res, next);
  }
}

export interface WebRemoteConfig {
  buttons: string[];
}
