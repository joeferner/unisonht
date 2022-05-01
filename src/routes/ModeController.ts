import { Router } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { Query, Response } from 'tsoa';
import { setStatusCodeOnError } from '../types/ErrorWithStatusCode';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { MyGet, MyPost } from '../types/openApiDecorators';
import { UnisonHTServer } from '../UnisonHTServer';

export class ModeController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const modeController = new ModeController(server);

    router.get('/api/v1/mode', async (_req, res) => {
      res.send(await modeController.getMode());
    });

    router.post('/api/v1/mode', async (req, res) => {
      res.send(await modeController.switchMode(req.query.newModeId?.toString() ?? 'NOT SET'));
    });
  }

  static updateSwaggerJson(server: UnisonHTServer, swaggerJson: OpenApi) {
    if (swaggerJson.components?.schemas) {
      swaggerJson.components.schemas.GetModeResponse.properties.mode = {
        $ref: '#/components/schemas/Modes',
      };
      swaggerJson.components.schemas.SetModeResponse.properties.oldMode = {
        $ref: '#/components/schemas/Modes',
      };
      swaggerJson.components.schemas.SetModeResponse.properties.mode = {
        $ref: '#/components/schemas/Modes',
      };
      swaggerJson.components.schemas.Modes = {
        type: 'string',
        enum: server.config.modes,
      };
    } else {
      console.error('missing: swaggerJson.components.schemas');
    }

    if (swaggerJson.paths?.['/api/v1/mode']?.post?.parameters?.[0]) {
      swaggerJson.paths['/api/v1/mode'].post.parameters[0].schema = {
        $ref: '#/components/schemas/Modes',
      };
    } else {
      console.error("missing: swaggerJson.paths['/api/v1/mode'].post.parameters[0]");
    }
  }

  @MyGet('/api/v1/mode')
  public async getMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.modeId ?? this.server.config.defaultModeId,
    };
  }

  @MyPost('/api/v1/mode')
  @Response(StatusCodes.NOT_FOUND, 'Mode not found')
  public async switchMode(@Query() newModeId: string): Promise<SetModeResponse> {
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
