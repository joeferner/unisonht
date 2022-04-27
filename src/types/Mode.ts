import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTServer } from "../UnisonHTServer";
import {
  Action,
  ForwardToDeviceAction,
  ModeConfig,
  ModeConfigButton,
  SwitchModeAction,
} from "./Config";
import { OpenApi } from "./openApi/v3/OpenApi";
import express from "express";
import Debug from "debug";
import { setStatusCodeOnError } from "./ErrorWithStatusCode";
import { StatusCodes } from "http-status-codes";

export class Mode {
  private readonly debug = Debug(`unisonht:unisonht:mode:${this.id}`);
  private readonly router: express.Router;

  constructor(
    private readonly server: UnisonHTServer,
    private readonly config: ModeConfig
  ) {
    this.router = express.Router();
    this.router.post(`/api/v1/mode/${this.id}/button`, async (req, res) => {
      if (!req.query.button) {
        throw setStatusCodeOnError(
          new Error("'button' is required"),
          StatusCodes.BAD_REQUEST
        );
      }
      const buttonName = req.query.button?.toString();
      const button = this.getButtonByName(buttonName);
      if (!button) {
        throw setStatusCodeOnError(
          new Error(`Could not find button: ${buttonName}`),
          StatusCodes.NOT_FOUND
        );
      }
      await this.handleButtonPress(buttonName, button);
      res.json({});
    });
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
    swaggerJson.paths[`/api/v1/mode/${this.id}/button`] = {
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

  protected async handleButtonPress(
    buttonName: string,
    button: ModeConfigButton
  ): Promise<void> {
    this.debug("handle button press: %s", buttonName);
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
    this.debug(
      'forwarding button "%s" to device "%s"',
      buttonName,
      action.deviceId
    );
    const device = this.server.devices.find((d) => d.id === action.deviceId);
    if (!device) {
      throw new Error(`could not find device: ${action.deviceId}`);
    }
    return device.handleButtonPress(buttonName);
  }

  private executeActionSwitchMode(action: SwitchModeAction): Promise<void> {
    this.debug("switching mode to %s", action.modeId);
    return this.server.switchMode(action.modeId, action.deviceInputs);
  }

  get id(): string {
    return this.config.id;
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
}
