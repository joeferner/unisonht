import { ServerResponse } from 'http';
import * as fs from 'fs';

export class StaticFile {
  private _path: string;
  private _contentType: string;

  constructor(path: string, contentType?: string) {
    this._path = path;
    this._contentType = contentType || StaticFile.guessContentType(path);
  }

  private static guessContentType(path: string): string {
    if (path.endsWith('.html')) {
      return 'text/html';
    } else if (path.endsWith('.css')) {
      return 'text/css';
    } else if (path.endsWith('.js') || path.endsWith('.jsx')) {
      return 'application/javascript';
    } else if (path.endsWith('.ico')) {
      return 'image/x-icon';
    } else if (path.endsWith('.woff2')) {
      return 'font/woff2';
    } else if (path.endsWith('.map')) {
      return 'application/octet-stream';
    } else if (path.endsWith('.svg')) {
      return 'image/svg+xml';
    } else {
      console.warn('could not determine content type: ', path);
      return 'application/octet-stream';
    }
  }

  get path(): string {
    return this._path;
  }

  get contentType(): string {
    return this._contentType;
  }

  send(res: ServerResponse): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      res.writeHead(200, {
        'Content-Type': this.contentType,
      });
      fs.createReadStream(this.path)
        .on('error', reject)
        .pipe(res)
        .on('finish', resolve);
    });
  }
}
