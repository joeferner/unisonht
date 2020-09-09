import { UnisonHTMode } from '../UnisonHTMode';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { NextFunction, UnisonHT } from '../UnisonHT';
import Debug from 'debug';
import { SupportedButtons } from '../UnisonHTPlugin';

const debug = Debug('UnisonHT:CurrentMode');

export class CurrentMode implements UnisonHTMode {
    public enter(): Promise<void> {
        throw new Error('should not enter "current" mode');
    }

    public getModeName(): string {
        return 'current';
    }

    public async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.get(this, '/mode', {
            handler: this.handleModeInfo.bind(this),
        });
        unisonht.get(this, ':partialPath*', {
            handler: this.handle.bind(this),
        });
        unisonht.post(this, ':partialPath*', {
            handler: this.handle.bind(this),
        });
    }

    private async handleModeInfo(request: RouteHandlerRequest, response: RouteHandlerResponse): Promise<void> {
        const currentMode = request.unisonht.getCurrentMode();
        response.send({
            currentMode: currentMode ? currentMode.getModeName() : null,
        });
    }

    private async handle(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        const currentMode = request.unisonht.getCurrentMode();
        if (!currentMode) {
            next();
            return;
        }
        const partialPath = request.parameters.partialPath;
        const newUrl = `/mode/${currentMode.getModeName()}/${partialPath}`;
        debug(`redirect to ${newUrl}`);
        await request.unisonht.execute(
            {
                ...request,
                url: newUrl,
            },
            response,
            next,
        );
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }
}
