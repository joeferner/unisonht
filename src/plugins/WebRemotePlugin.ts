import { NextFunction, Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { PluginConfig } from '../types/Config';
import { setStatusCodeOnError } from '../types/ErrorWithStatusCode';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { Plugin, PluginFactory } from '../types/Plugin';
import { validateJson } from '../types/TypeUtils';
import { UnisonHTServer } from '../UnisonHTServer';
import { WebRemoteConfig } from './WebRemotePluginConfig';

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

    validateJson('WebRemoteConfig', config.data, {
      sourcePath: path.join(__dirname, 'WebRemotePluginConfig.ts'),
      tsconfigPath: path.join(__dirname, '../../tsconfig.json'),
    });

    this.router.post(
      `${this.apiUrlPrefix}/button`,
      async (req: Request<unknown, unknown, unknown, WebRemoteButtonQuery>, res) => {
        if (!req.query.button) {
          throw setStatusCodeOnError(new Error("'button' is required"), StatusCodes.BAD_REQUEST);
        }
        await this.handleWebRequestPressButton(req.query.button.toString());
        res.json({});
      },
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

  override updateOpenApi(opanApi: OpenApi): Promise<void> {
    super.updateOpenApi(opanApi);

    opanApi.paths[`${this.apiUrlPrefix}/button`] = {
      post: {
        operationId: 'pressButton',
        tags: this.openApiTags,
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

  override handleWebRequest(req: Request, res: Response, next: NextFunction): void {
    this.router(req, res, next);
  }
}

export interface WebRemoteButtonQuery {
  button: string;
}
