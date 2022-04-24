import { Body, Get, Post, Response, Route, SuccessResponse } from "tsoa";
import { UnisonHTServer } from "../UnisonHTServer";
import { StatusCodes } from "http-status-codes";
import { setStatusCodeOnError } from "../types/ErrorWithStatusCode";
import { Router } from "express-serve-static-core";
import asyncHandler from "express-async-handler";

@Route("api/v1/mode")
export class ModeController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const modeController = new ModeController(server);

    router.get(
      "/api/v1/mode",
      asyncHandler(async (_req, res) => {
        res.send(await modeController.getMode());
      })
    );

    router.post(
      "/api/v1/mode",
      asyncHandler(async (req, res) => {
        res.send(await modeController.switchMode(req.body));
      })
    );
  }

  @Get("/")
  public async getMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.mode ?? this.server.config.defaultMode,
    };
  }

  @Post("/")
  @SuccessResponse(StatusCodes.OK)
  @Response(StatusCodes.BAD_REQUEST, "Invalid mode")
  public async switchMode(@Body() req: SetModeRequest): Promise<SetModeResponse> {
    const newMode = req.mode;

    if (!this.server.config.modes.includes(newMode)) {
      const err = new Error(`invalid mode: ${newMode}`);
      setStatusCodeOnError(err, StatusCodes.BAD_REQUEST);
      throw err;
    }

    await this.server.switchMode(newMode);
    return {
      mode: newMode,
    };
  }
}

interface GetModeResponse {
  mode: string;
}

interface SetModeRequest {
  mode: string;
}

interface SetModeResponse {
  mode: string;
}
