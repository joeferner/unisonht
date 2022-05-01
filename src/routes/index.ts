import Router from 'express-promise-router';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { UnisonHTServer } from '../UnisonHTServer';
import { DevicesController } from './DevicesController';
import { ModeController } from './ModeController';

export const OPENAPI_UNISONHT_CORE_TAGS = ['UnisonHT: Core'];

export function createRouter(server: UnisonHTServer) {
  const router = Router();
  ModeController.init(server, router);
  DevicesController.init(server, router);
  return router;
}

export function routerUpdateOpenApi(server: UnisonHTServer, openApi: OpenApi): void {
  ModeController.updateOpenApi(server, openApi);
  DevicesController.updateOpenApi(server, openApi);
}
