import { Router } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { OPENAPI_UNISONHT_CORE_TAGS } from '.';
import { setStatusCodeOnError } from '../types/ErrorWithStatusCode';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { UnisonHTServer } from '../UnisonHTServer';

const ROUTE_MODE = '/api/v1/mode';

export class ModeController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const modeController = new ModeController(server);

    router.get(ROUTE_MODE, async (_req, res) => {
      res.send(await modeController.getCurrentMode());
    });

    router.post(ROUTE_MODE, async (req, res) => {
      res.send(await modeController.switchMode(req.query.newModeId?.toString() ?? 'NOT SET'));
    });
  }

  static updateOpenApi(server: UnisonHTServer, openApi: OpenApi) {
    const modeIds = server.config.modes.map((m) => m.id);
    openApi.paths[ROUTE_MODE] = {
      get: {
        operationId: 'getCurrentMode',
        tags: OPENAPI_UNISONHT_CORE_TAGS,
        responses: {
          [200]: {
            description: 'current mode',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mode: {
                      type: 'string',
                      enum: modeIds,
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: 'switchMode',
        tags: OPENAPI_UNISONHT_CORE_TAGS,
        parameters: [
          {
            in: 'query',
            name: 'mode',
            required: true,
            schema: {
              type: 'string',
              enum: modeIds,
            },
          },
        ],
        responses: {
          [200]: {
            description: 'switch mode',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    oldModeId: {
                      type: 'string',
                      enum: modeIds,
                    },
                    modeId: {
                      type: 'string',
                      enum: modeIds,
                    },
                  },
                },
              },
            },
          },
          [404]: {
            description: 'mode not found',
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
  }

  public async getCurrentMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.modeId ?? this.server.config.defaultModeId,
    };
  }

  public async switchMode(newModeId: string): Promise<SetModeResponse> {
    if (!newModeId || !this.server.config.modes.find((m) => m.id === newModeId)) {
      throw setStatusCodeOnError(new Error(`invalid mode: ${newModeId}`), StatusCodes.NOT_FOUND);
    }

    const oldModeId = this.server.modeId;
    await this.server.switchMode(newModeId);
    return {
      oldModeId: oldModeId,
      modeId: newModeId,
    };
  }
}

interface GetModeResponse {
  mode: string;
}

interface SetModeResponse {
  oldModeId?: string;
  modeId: string;
}
