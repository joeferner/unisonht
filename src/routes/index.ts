import Router from 'express-promise-router';
import { OpenApi } from '../types/openApi/v3/OpenApi';
import { UnisonHTServer } from '../UnisonHTServer';
import { DevicesController } from './DevicesController';
import { ModeController } from './ModeController';

export function createRouter(server: UnisonHTServer) {
  const router = Router();
  ModeController.init(server, router);
  DevicesController.init(server, router);
  return router;
}

export function routerUpdateSwaggerJson(server: UnisonHTServer, swaggerJson: OpenApi): void {
  ModeController.updateSwaggerJson(server, swaggerJson);
}
