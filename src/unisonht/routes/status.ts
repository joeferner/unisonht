import { UnisonHTRequest } from '../UnisonHTRequest';

export async function status(req: UnisonHTRequest): Promise<StatusResponse> {
  return {
    currentMode: req.app.currentMode ? req.app.currentMode.name : null,
  };
}

interface StatusResponse {
  currentMode: string | null;
}
