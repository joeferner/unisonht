import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { NextFunction, UnisonHT } from '../UnisonHT';
import { Method } from '../Method';

export interface WebApiOptions {
    port: number;
}

export interface WebApiRouteHandlerRequest extends RouteHandlerRequest {
    httpRequest: IncomingMessage;
}

export interface WebApiRouteHandlerResponse extends RouteHandlerResponse {
    httpResponse: ServerResponse;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function instanceOfWebApiRouteHandlerResponse(obj: any): obj is WebApiRouteHandlerResponse {
    return 'httpResponse' in obj;
}

export class WebApi implements UnisonHTPlugin {
    private readonly server: Server;
    private readonly options: WebApiOptions;
    private unisonht: UnisonHT | undefined;

    constructor(options: WebApiOptions) {
        this.options = options;
        this.server = http.createServer(async (req, res) => {
            try {
                await this.handleHttpRequest(req, res);
            } catch (err) {
                console.error('failed to handler request', err);
            }
        });
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }

    public async initialize(unisonht: UnisonHT): Promise<void> {
        this.unisonht = unisonht;
        return new Promise((resolve) => {
            this.server.listen(this.options.port, () => {
                resolve();
            });
        });
    }

    private async handleHttpRequest(req: IncomingMessage, res: ServerResponse) {
        if (!this.unisonht) {
            throw new Error('unisonht not initialized');
        }
        if (!req.url) {
            res.statusCode = 400;
            res.end();
            return;
        }
        const request: WebApiRouteHandlerRequest = {
            unisonht: this.unisonht,
            url: req.url,
            parameters: {},
            method: req.method as Method,
            httpRequest: req,
        };
        const response: WebApiRouteHandlerResponse = {
            httpResponse: res,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            send: (result?: any) => {
                if (!result) {
                    res.statusCode = 204;
                    res.end();
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(result ? JSON.stringify(result) : undefined);
                }
            },
        };
        const next: NextFunction = (err?: Error) => {
            if (err) {
                console.error(`failed to handle request: ${req.url}`, err);
                res.statusCode = 500;
                res.end();
                return;
            }
            res.statusCode = 404;
            res.end();
        };
        try {
            await this.unisonht.execute(request, response, next);
        } catch (err) {
            console.error(`failed to handle request: ${req.url}`, err);
            res.statusCode = 500;
            res.end();
        }
    }
}
