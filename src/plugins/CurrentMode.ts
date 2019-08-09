import {UnisonHTMode} from "../UnisonHTMode";
import {RouteHandlerRequest} from "../RouteHandlerRequest";
import {RouteHandlerResponse} from "../RouteHandlerResponse";
import {NextFunction, UnisonHT} from "../UnisonHT";
import Debug from 'debug';

const debug = Debug('UnisonHT:CurrentMode');

export class CurrentMode implements UnisonHTMode {
    enter(): Promise<void> {
        throw new Error('should not enter "current" mode');
    }

    getModeName(): string {
        return 'current';
    }

    async handleKeyPress(
        key: string,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: (err?: Error) => void
    ): Promise<void> {
        next();
    }

    async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.get(this, ':partialPath*', {
            handler: this.handle.bind(this)
        });
        unisonht.post(this, ':partialPath*', {
            handler: this.handle.bind(this)
        });
    }

    private async handle(
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction
    ): Promise<void> {
        const currentMode = request.unisonht.getCurrentMode();
        if (!currentMode) {
            next();
            return;
        }
        const partialPath = request.parameters['partialPath'];
        const newUrl = `/mode/${currentMode.getModeName()}/${partialPath}`;
        debug(`redirect to ${newUrl}`);
        await request.unisonht.execute(
            {
                ...request,
                url: newUrl
            },
            response,
            next
        );
    }
}
