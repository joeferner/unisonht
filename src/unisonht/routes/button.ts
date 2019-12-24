import { UnisonHTRequest } from '../UnisonHTRequest';

export async function button(req: UnisonHTRequest): Promise<ButtonResponse> {
  const remote = req.parameters['remote'];
  const button = req.parameters['button'];
  const repeat = parseInt(req.parameters['repeat'] || '1');
  await req.app.handleButton({
    remote,
    button,
    repeat,
  });
  return {};
}

interface ButtonResponse {
}
