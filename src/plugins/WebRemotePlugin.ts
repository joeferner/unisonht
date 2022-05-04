import { NextFunction, Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { getType, Type } from 'tst-reflect';
import { PluginConfig } from '../types/Config';
import { setStatusCodeOnError } from '../types/ErrorWithStatusCode';
import { OpenApiResponse, Post, QueryParam } from '../types/openApiDecorators';
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
        await this.pressButton(req.query.button.toString());
        res.send();
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

  @Post('`${this.apiUrlPrefix}/button`')
  @OpenApiResponse(404, 'Button not found')
  private pressButton(@QueryParam({ enum: 'this.config.data.buttons' }) button: string): Promise<void> {
    if (!this.config.data.buttons.includes(button)) {
      throw setStatusCodeOnError(new Error(`Invalid button "${button}"`), StatusCodes.NOT_FOUND);
    }

    this.debug('press button: %s', button);
    return this.server.pressButton(button);
  }

  override getOpenApiType(): Type | undefined {
    return getType<WebRemotePlugin>();
  }

  override handleWebRequest(req: Request, res: Response, next: NextFunction): void {
    this.router(req, res, next);
  }
}

export interface WebRemoteButtonQuery {
  button: string;
}
