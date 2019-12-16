import { UnisonHTRequest } from '../UnisonHTRequest';
import { StaticFile } from '../StaticFile';
import { NODE_MODULES_DIR } from './index';
import * as path from 'path';
import * as fs from 'fs';

export async function libFile(req: UnisonHTRequest, next: (err?: Error) => void): Promise<StaticFile | undefined> {
  const relativeUrl = req.url.substr('/lib/'.length);
  const fileName = path.resolve(NODE_MODULES_DIR, relativeUrl);
  try {
    await fs.promises.access(fileName, fs.constants.R_OK);
  } catch (err) {
    next();
    return;
  }
  return new StaticFile(fileName);
}