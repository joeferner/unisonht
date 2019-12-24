import { UnisonHT } from '../UnisonHT';
import { modeList } from './modeList';
import { modeSet } from './modeSet';
import { deviceList } from './deviceList';
import { status } from './status';
import * as path from 'path';
import { libFile } from './libFile';
import { StaticFile } from '../StaticFile';
import { publicFile } from './publicFile';
import { button } from './button';

export const PUBLIC_DIR = path.join(__dirname, '..', '..', '..', 'src', 'unisonht', 'routes', 'public');
export const NODE_MODULES_DIR = path.join(__dirname, '..', '..', '..', 'node_modules');

export function initializeRoutes(app: UnisonHT) {
  app.onGet('/favicon.ico', async () => new StaticFile(path.join(PUBLIC_DIR, 'favicon.ico')));
  app.onGet('/status', status);
  app.onGet('/mode', modeList);
  app.onPost('/mode', modeSet);
  app.onGet('/device', deviceList);
  app.onPost('/button', button);
  app.onGet(/\/lib\/.*/, libFile);
  app.onGet('/', async () => new StaticFile(path.join(PUBLIC_DIR, 'index.html')));
  app.onGet(/.*/, publicFile);
}
