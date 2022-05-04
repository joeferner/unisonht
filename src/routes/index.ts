import Router from 'express-promise-router';
import { OpenApiProvider } from '../types/OpenApiProvider';
import { UnisonHTServer } from '../UnisonHTServer';
import { DevicesController } from './DevicesController';
import { ModeController } from './ModeController';

export const OPENAPI_UNISONHT_CORE_TAGS = ['UnisonHT: Core'];

let modeController: ModeController;
let devicesController: DevicesController;

export function createRouter(server: UnisonHTServer) {
  const router = Router();
  modeController = new ModeController(server, router);
  devicesController = new DevicesController(server, router);
  return router;
}

export function routerGetControllers(): OpenApiProvider[] {
  return [modeController, devicesController];
}
