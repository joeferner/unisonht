import { UnisonHTRequest } from '../UnisonHTRequest';

export async function modeSet(req: UnisonHTRequest): Promise<ModeSetResponse> {
  const mode = req.parameters['mode'];
  await req.app.switchToMode(mode);
  return { mode };
}

interface ModeSetResponse {
  mode: string;
}
