import {UnisonHTPlugin} from "../UnisonHTPlugin";
import {RouteHandlerResponse} from "../RouteHandlerResponse";
import {RouteHandlerRequest} from "../RouteHandlerRequest";
import {NextFunction, UnisonHT} from "../UnisonHT";

export class DefaultKeyHandler implements UnisonHTPlugin {
    async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.post(this, '/key/:key', {
            handler: this.handleKeyPressRoute.bind(this)
        });
    }

    async handleKeyPressRoute(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction
    ): Promise<void> {
        const key = request.parameters['key'];
        await this.handleKeyPress(key, request, response, next);
    }

    async handleKeyPress(
        key: string,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: (err?: Error) => void
    ): Promise<void> {
        await request.unisonht.executePost(`/mode/current/key/${key}`);
    }
}
