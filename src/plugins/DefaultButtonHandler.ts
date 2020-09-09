import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { NextFunction, UnisonHT } from '../UnisonHT';
import { instanceOfUnisonHTDevice, UnisonHTDevice } from '../UnisonHTDevice';
import { UnisonHTMode } from '../UnisonHTMode';
import Debug from 'debug';

const debug = Debug('UnisonHT:DefaultButtonHandler');

export class DefaultButtonHandler implements UnisonHTPlugin {
    public async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.post(this, '/button/:button', {
            handler: this.handleButtonPressRoute.bind(this),
        });
        unisonht.on('deviceAdded', ({ device }) => {
            this.handleDeviceAdded(unisonht, device);
        });
        unisonht.on('modeAdded', ({ mode }) => {
            this.handleModeAdded(unisonht, mode);
        });
    }

    private handleDeviceAdded(unisonht: UnisonHT, device: UnisonHTDevice) {
        unisonht.post(device, 'button/:button', {
            handler: this.handlePluginButtonPress.bind(this, unisonht, device),
        });
    }

    private handleModeAdded(unisonht: UnisonHT, mode: UnisonHTMode) {
        unisonht.post(mode, 'button/:button', {
            handler: this.handlePluginButtonPress.bind(this, unisonht, mode),
        });
    }

    private async handlePluginButtonPress(
        unisonht: UnisonHT,
        plugin: UnisonHTPlugin,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
        next: NextFunction,
    ): Promise<void> {
        const button = request.parameters.button;
        if (!button) {
            throw Error(`Missing 'button' parameter`);
        }
        debug(`handleButtonPress(plugin=${plugin.constructor.name}, button=${button})`);
        const newNext = async (err?: Error) => {
            if (err) {
                next(err);
                return;
            }
            try {
                if (instanceOfUnisonHTDevice(plugin)) {
                    const req = {
                        ...request,
                        url: `/mode/current/button/${button}`,
                    };
                    await unisonht.execute(req, response, next);
                } else {
                    next();
                }
            } catch (err) {
                next(err);
            }
        };
        if (plugin.handleButtonPress) {
            try {
                await plugin.handleButtonPress(button, request, response, newNext);
            } catch (err) {
                next(err);
            }
        } else {
            const foundButton = plugin.getSupportedButtons()[button];
            if (!foundButton) {
                next();
            } else {
                try {
                    await foundButton.handleButtonPress(button, request, response, next);
                } catch (err) {
                    next(err);
                }
            }
        }
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
