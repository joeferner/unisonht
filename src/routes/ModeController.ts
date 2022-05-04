import { Router } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { getType, Type } from 'tst-reflect';
import { OPENAPI_UNISONHT_CORE_TAGS } from '.';
import { setStatusCodeOnError } from '../types/ErrorWithStatusCode';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { Get, OpenApiResponse, Post, QueryParam } from '../types/openApiDecorators';
import { OpenApiProvider } from '../types/OpenApiProvider';
import { UnisonHTServer } from '../UnisonHTServer';

const ROUTE_MODE = '/api/v1/mode';

export class ModeController implements OpenApiProvider {
  constructor(private readonly server: UnisonHTServer, router: Router) {
    router.get(ROUTE_MODE, async (_req, res) => {
      res.send(await this.getCurrentMode());
    });

    router.post(ROUTE_MODE, async (req, res) => {
      res.send(await this.switchMode(req.query.newModeId?.toString() ?? 'NOT SET'));
    });
  }

  get openApiTags(): string[] {
    return OPENAPI_UNISONHT_CORE_TAGS;
  }

  get apiUrlPrefix(): string {
    return ROUTE_MODE;
  }

  getOpenApiType(): Type | undefined {
    return getType<ModeController>();
  }

  get modeIds(): string[] {
    return this.server.config.modes.map((m) => m.id);
  }

  updateOpenApi(openApi: OpenApi): void {}

  @Get('`${this.apiUrlPrefix}`')
  public async getCurrentMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.modeId ?? this.server.config.defaultModeId,
    };
  }

  @Post('`${this.apiUrlPrefix}`')
  @OpenApiResponse(404, 'Mode not found')
  public async switchMode(@QueryParam({ enum: 'this.modeIds' }) newModeId: string): Promise<SetModeResponse> {
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
