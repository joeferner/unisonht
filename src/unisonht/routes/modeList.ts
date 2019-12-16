import { UnisonHTRequest } from '../UnisonHTRequest';

export async function modeList(req: UnisonHTRequest): Promise<ModeListResponse> {
  return {
    modeNames: req.app.modes.map(mode => mode.name),
  };
}

interface ModeListResponse {
  modeNames: string[];
}
