import { Get, Post, Query, Response, Route, SuccessResponse } from "tsoa";
import { UnisonHTServer } from "../UnisonHTServer";
import { StatusCodes } from "http-status-codes";
import { setStatusCodeOnError } from "../types/ErrorWithStatusCode";
import { Router } from "express-serve-static-core";
import asyncHandler from "express-async-handler";
import { OpenApi } from "../types/openApi/v3/OpenApi";

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
        res.send(await modeController.switchMode(req.query.newMode?.toString()));
      })
    );
  }

  static updateSwaggerJson(server: UnisonHTServer, swaggerJson: OpenApi) {
    swaggerJson.components!.schemas!.GetModeResponse!.properties!.mode = {
      $ref: "#/components/schemas/Modes",
    };
    swaggerJson.components!.schemas!.SetModeResponse!.properties!.oldMode = {
      $ref: "#/components/schemas/Modes",
    };
    swaggerJson.components!.schemas!.SetModeResponse!.properties!.mode = {
      $ref: "#/components/schemas/Modes",
    };
    swaggerJson.paths["/api/v1/mode"]!.post!.parameters![0]!.schema = {
      $ref: "#/components/schemas/Modes",
    };

    swaggerJson.components!.schemas.Modes = {
      type: "string",
      enum: server.config.modes,
    };
    console.log(swaggerJson.paths["/api/v1/mode"]?.post?.parameters);
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
  public async switchMode(@Query() newMode?: string): Promise<SetModeResponse> {
    if (!newMode || !this.server.config.modes.includes(newMode)) {
      const err = new Error(`invalid mode: ${newMode}`);
      setStatusCodeOnError(err, StatusCodes.BAD_REQUEST);
      throw err;
    }

    const oldMode = this.server.mode;
    await this.server.switchMode(newMode);
    return {
      oldMode,
      mode: newMode,
    };
  }
}

interface GetModeResponse {
  mode: string;
}

interface SetModeResponse {
  oldMode?: string;
  mode: string;
}
