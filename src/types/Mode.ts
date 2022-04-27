import Debug from "debug";
import express from "express";
import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "../UnisonHTServer";
import {
  Action,
  ForwardToDeviceAction,
  ModeConfig,
  ModeConfigButton,
  SwitchModeAction,
} from "./Config";
import { setStatusCodeOnError } from "./ErrorWithStatusCode";
import { OpenApi } from "./openApi/v3/OpenApi";
import asyncHandler from "express-async-handler";

export class Mode {
  protected readonly debug = Debug(
    `unisonht:unisonht:mode:${this.name}:${this.id}`
  );
  protected readonly router: express.Router;

  constructor(
    protected readonly server: UnisonHTServer,
    protected readonly config: ModeConfig
  ) {
    this.router = express.Router();
    this.router.post(
      `${this.apiUrlPrefix}/button`,
      asyncHandler(async (req, res) => {
        if (!req.query.button) {
          throw setStatusCodeOnError(
            new Error("'button' is required"),
            StatusCodes.BAD_REQUEST
          );
        }
        const buttonName = req.query.button?.toString();
        await this.pressButton(buttonName);
        res.json({});
      })
    );
  }

  private getButtonByName(buttonName: string): ModeConfigButton | undefined {
    let button = this.config.buttons.find((b) => b.name === buttonName);
    if (button) {
      return button;
    }
    button = this.config.buttons.find((b) => b.name === "*");
    if (button) {
      return button;
    }
    return undefined;
  }

  updateSwaggerJson(swaggerJson: OpenApi): void {
    swaggerJson.paths[`${this.apiUrlPrefix}/button`] = {
      post: {
        operationId: "pressButton",
        tags: [`Mode: ${this.config.name}`],
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
          [404]: {
            description: "Button not found",
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

  async pressButton(buttonName: string): Promise<void> {
    this.debug("handle button press: %s", buttonName);
    const button = this.getButtonByName(buttonName);
    if (!button) {
      throw setStatusCodeOnError(
        new Error(`Could not find button: ${buttonName}`),
        StatusCodes.NOT_FOUND
      );
    }
    for (const action of button.actions) {
      await this.executeAction(action, buttonName);
    }
  }

  protected executeAction(action: Action, buttonName: string): Promise<void> {
    switch (action.type) {
      case "forwardToDevice":
        return this.executeActionForwardToDevice(
          action as ForwardToDeviceAction,
          buttonName
        );
      case "switchMode":
        return this.executeActionSwitchMode(action as SwitchModeAction);
      default:
        throw new Error(`unhandled action type: ${action.type}`);
    }
  }

  private executeActionForwardToDevice(
    action: ForwardToDeviceAction,
    buttonName: string
  ): Promise<void> {
    const device = this.server.devices.find((d) => d.id === action.deviceId);
    if (this.debug.enabled) {
      this.debug(
        'action: forwarding button "%s" to device %s%s',
        buttonName,
        action.deviceId,
        device ? ` (${device.name})` : "NOT FOUND"
      );
    }

    if (!device) {
      throw new Error(`could not find device: ${action.deviceId}`);
    }
    return device.handleButtonPress(buttonName);
  }

  private executeActionSwitchMode(action: SwitchModeAction): Promise<void> {
    this.debug("action: switching mode to %s", action.modeId);
    return this.server.switchMode(action.modeId, action.deviceInputs);
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get buttons(): string[] {
    return this.config.buttons.flatMap((button) => {
      if (
        button.name === "*" &&
        button.actions.length === 1 &&
        button.actions[0].type === "forwardToDevice"
      ) {
        const deviceId = (button.actions[0] as ForwardToDeviceAction).deviceId;
        const device = this.server.devices.find((d) => d.id === deviceId);
        if (!device) {
          throw new Error(`could not find device with id: ${deviceId}`);
        }
        return device.buttons.filter(
          (deviceButton) =>
            !this.config.buttons.find((b) => b.name === deviceButton)
        );
      }
      return [button.name];
    });
  }

  protected get urlPrefix(): string {
    return `/mode/${this.id}`;
  }

  protected get apiUrlPrefix(): string {
    return `/api/v1/mode/${this.id}`;
  }
}
