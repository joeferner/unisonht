import { SupportedButtons, UnisonHTPlugin } from '../UnisonHTPlugin';
import { UnisonHT } from '../UnisonHT';
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
    await response.send({
      type: mode.constructor.name,
    });
  }

  public getSupportedButtons(): SupportedButtons {
    return {};
  }
}
