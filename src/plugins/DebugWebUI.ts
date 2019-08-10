import { SupportedKeys, UnisonHTPlugin } from '../UnisonHTPlugin';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { NextFunction, UnisonHT } from '../UnisonHT';
import { instanceOfWebApiRouteHandlerResponse, WebApiRouteHandlerResponse } from './WebApi';
import path from 'path';
import fs from 'fs';

export class DebugWebUI implements UnisonHTPlugin {
  private readonly webAssetsPath: string;
  private readonly webAssetsDistPath: string;
  private readonly webAssetsNodeModulesPath: string;

  constructor() {
    this.webAssetsPath = path.resolve(__dirname, '../../web/DebugWebUI');
    this.webAssetsDistPath = path.resolve(__dirname, '../../web/dist');
    this.webAssetsNodeModulesPath = path.resolve(__dirname, '../../node_modules');
  }

  public async initialize(unisonht: UnisonHT): Promise<void> {
    unisonht.get(this, '/debugwebui', this.serveFile(path.join(this.webAssetsPath, 'index.html'), 'text/html'));
    unisonht.get(
      this,
      '/debugwebui/debugWebUI.js',
      this.serveFile(path.join(this.webAssetsDistPath, 'debugWebUI.js'), 'text/javascript'),
    );
    unisonht.get(
      this,
      '/debugwebui/react.js',
      this.serveFile(path.join(this.webAssetsNodeModulesPath, 'react/umd/react.development.js'), 'text/javascript'),
    );
    unisonht.get(
      this,
      '/debugwebui/react-dom.js',
      this.serveFile(
        path.join(this.webAssetsNodeModulesPath, 'react-dom/umd/react-dom.development.js'),
        'text/javascript',
      ),
    );
  }

  public getSupportedKeys(): SupportedKeys {
    return {};
  }

  public async handleKeyPress(
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> {
    next();
  }

  private serveFile(filePath: string, contentType: string) {
    return {
      handler: async (
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
      ): Promise<void> => {
        if (!instanceOfWebApiRouteHandlerResponse(response)) {
          return next(new Error('only valid for web requests'));
        }
        const indexContents = await fs.promises.readFile(filePath, 'utf8');
        const res = (response as WebApiRouteHandlerResponse).httpResponse;
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(indexContents);
      },
    };
  }
}
