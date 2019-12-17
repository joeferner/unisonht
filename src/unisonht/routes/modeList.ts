import { UnisonHTRequest } from '../UnisonHTRequest';

export async function modeList(req: UnisonHTRequest): Promise<ModeListResponse> {
  return {
    modes: req.app.modes.map(mode => {
      return {
        name: mode.name,
      };
    }),
  };
}

interface ModeListResponse {
  modes: ModeListItem[];
}

interface ModeListItem {
  name: string;
}