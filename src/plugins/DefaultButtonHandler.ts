import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { NextFunction, UnisonHT } from '../UnisonHT';

export class DefaultButtonHandler implements UnisonHTPlugin {
    public async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.post(this, '/button/:button', {
            handler: this.handleButtonPressRoute.bind(this),
        });
    }

    public async handleButtonPressRoute(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        const button = request.parameters.button;
        await this.handleButtonPress(button, request, response, next);
    }

    public async handleButtonPress(
        button: string,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse, // eslint-disable-line @typescript-eslint/no-unused-vars
        next: (err?: Error) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<void> {
        await request.unisonht.executePost(`/mode/current/button/${button}`);
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }
}
