import { Get, Route } from "tsoa";
import { UnisonHTServer } from "../../UnisonHTServer";

interface GetModeResponse {
  mode: string;
}

@Route("api/mode")
export default class PingController {
  constructor(private readonly server: UnisonHTServer) {}

  @Get("/")
  public async getMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.mode,
    };
  }
}
