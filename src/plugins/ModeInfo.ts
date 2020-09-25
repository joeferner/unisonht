import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { ModeStatusResponse, ModeStatusResponseButtons, UnisonHT } from '../UnisonHT';
import { RouteHandlerRequest } from '../RouteHandlerRequest';
import { RouteHandlerResponse } from '../RouteHandlerResponse';
import { UnisonHTMode } from '../UnisonHTMode';

export class ModeInfo implements UnisonHTPlugin {
    public async initialize(unisonht: UnisonHT): Promise<void> {
        unisonht.on('modeAdded', ({ mode }) => {
            this.handleModeAdded(unisonht, mode);
        });
    }

    private handleModeAdded(unisonht: UnisonHT, mode: UnisonHTMode) {
        unisonht.get(mode, `/mode/${mode.getModeName()}`, {
            handler: this.handleModeInfo.bind(this, unisonht, mode),
        });
    }

    private async handleModeInfo(
        unisonht: UnisonHT,
        mode: UnisonHTMode,
        request: RouteHandlerRequest,
        response: RouteHandlerResponse,
    ): Promise<void> {
        const buttons: ModeStatusResponseButtons = {};
        const modeButtons = mode.getSupportedButtons();
        Object.keys(modeButtons).forEach((button) => {
            const b = modeButtons[button];
            buttons[button] = {
                name: b.name,
                description: b.description,
            };
        });

        const result: ModeStatusResponse = {
            name: mode.getModeName(),
            type: mode.constructor.name,
            buttons,
        };

        await response.send(result);
    }

    public getSupportedButtons(): SupportedButtons {
        return {};
    }
}
