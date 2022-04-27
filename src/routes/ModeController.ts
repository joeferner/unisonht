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
        res.send(
          await modeController.switchMode(
            req.query.newModeId?.toString() ?? "NOT SET"
          )
        );
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
  }

  @Get("/")
  public async getMode(): Promise<GetModeResponse> {
    return {
      mode: this.server.modeId ?? this.server.config.defaultModeId,
    };
  }

  @Post("/")
  @SuccessResponse(StatusCodes.OK)
  @Response(StatusCodes.NOT_FOUND, "Mode not found")
  public async switchMode(@Query() newModeId: string): Promise<SetModeResponse> {
    if (!newModeId || !this.server.config.modes.find((m) => m.id === newModeId)) {
      throw setStatusCodeOnError(
        new Error(`invalid mode: ${newModeId}`),
        StatusCodes.NOT_FOUND
      );
    }

    const oldModeId = this.server.modeId;
    await this.server.switchMode(newModeId);
    return {
      oldModeId: oldModeId,
      modeId: newModeId,
    };
  }
}

interface GetModeResponse {
  mode: string;
}

interface SetModeResponse {
  oldModeId?: string;
  modeId: string;
}
