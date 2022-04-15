import { Body, Get, Post, Response, Route, SuccessResponse } from "tsoa";
import { UnisonHTServer } from "../../UnisonHTServer";
import { StatusCodes } from "http-status-codes";

interface GetModeResponse {
  mode: string;
}

interface SetModeRequest {
  mode: string;
}

interface SetModeResponse {
  mode: string;
}

@Route("api/mode")
export default class ModeController {
  constructor(private readonly server: UnisonHTServer) {}

  @Get("/")
  public async getMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.mode,
    };
  }

  @Post("/")
  @SuccessResponse(StatusCodes.OK)
  @Response(StatusCodes.BAD_REQUEST, "Invalid mode")
  public async setMode(@Body() req: SetModeRequest): Promise<SetModeResponse> {
    await this.server.switchMode(req.mode);
    return {
      mode: this.server.mode,
    };
  }
}
