import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "../UnisonHTServer";
import { DeviceConfig } from "./Config";
import { OpenApi } from "./openApi/v3/OpenApi";
import express from "express";
import { setStatusCodeOnError } from "./ErrorWithStatusCode";
import { StatusCodes } from "http-status-codes";

export interface DeviceFactory {
  get id(): string;

  createDevice(server: UnisonHTServer, config: DeviceConfig): Promise<Device>;
}

export abstract class Device {
  private readonly router: express.Router;

  constructor(
    private readonly _id: string,
    private readonly _config: DeviceConfig,
    private readonly _server: UnisonHTServer
  ) {
    this.router = express.Router();
    this.router.post(`/api/v1/device/${this.id}/button`, async (req, res) => {
      if (!req.query.button) {
        throw setStatusCodeOnError(
          new Error("'button' is required"),
          StatusCodes.BAD_REQUEST
        );
      }
      await this.handleButtonPress(req.query.button?.toString());
      res.json({});
    });
  }

  get id(): string {
    return this._id;
  }

  get config(): DeviceConfig {
    return this._config;
  }

  get server(): UnisonHTServer {
    return this._server;
  }

  updateSwaggerJson(swaggerJson: OpenApi): void {
    swaggerJson.paths[`/api/v1/device/${this.id}/button`] = {
      post: {
        operationId: "pressButton",
        tags: [`Device: ${this.config.name}`],
        parameters: [
          {
            in: "query",
            name: "button",
            required: true,
            schema: {
              type: "string",
              enum: this.buttons,
            },
          },
        ],
        responses: {
          [200]: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
        },
      },
    };
  }

  handleWebRequest(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction
  ): void {
    this.router(req, resp, next);
  }

  abstract handleButtonPress(button: string): Promise<void>;

  abstract switchMode(
    oldModeId: string | undefined,
    newModeId: string
  ): Promise<void>;

  abstract switchInput(inputName: string): Promise<void>;

  protected shouldBeActiveForMode(mode: string): boolean {
    return this.config.activeModes.includes(mode) ?? false;
  }

  isActive(): boolean {
    return this.shouldBeActiveForMode(this.server.modeId ?? "NOT SET");
  }

  abstract getPowerState(): Promise<PowerState>;

  abstract get buttons(): string[];
}

export enum PowerState {
  ON = "ON",
  OFF = "OFF",
}
