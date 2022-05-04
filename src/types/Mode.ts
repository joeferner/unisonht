import Debug from 'debug';
import express from 'express';
import Router from 'express-promise-router';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { ForwardToDeviceActionConfig } from '../actions/ForwardToDeviceAction';
import { UnisonHTServer } from '../UnisonHTServer';
import { Action } from './Action';
import { ActionConfig, ModeConfig, ModeConfigButton } from './Config';
import { setStatusCodeOnError } from './ErrorWithStatusCode';
import { OpenApi } from './openApi/v3/OpenApi';
import { OpenApiProvider } from './OpenApiProvider';
import { getType, Type } from 'tst-reflect';
import { OpenApiResponse, Post, QueryParam } from './openApiDecorators';

export class Mode implements OpenApiProvider {
  protected readonly debug = Debug(`unisonht:unisonht:mode:${this.name}:${this.id}`);
  protected readonly router: express.Router;
  private readonly buttonActions: { [buttonName: string]: Action<ActionConfig>[] } = {};

  constructor(protected readonly server: UnisonHTServer, protected readonly config: ModeConfig) {
    for (const buttonConfig of config.buttons) {
      this.buttonActions[buttonConfig.name] = buttonConfig.actions.map((actionConfig) =>
        server.createAction(actionConfig),
      );
    }

    this.router = Router();
    this.router.post(`${this.apiUrlPrefix}/button`, async (req, res) => {
      if (!req.query.button) {
        throw setStatusCodeOnError(new Error("'button' is required"), StatusCodes.BAD_REQUEST);
      }
      const buttonName = req.query.button?.toString();
      await this.pressButton(buttonName);
      res.json({});
    });
  }

  private getButtonByName(buttonName: string): ModeConfigButton | undefined {
    let button = this.config.buttons.find((b) => b.name === buttonName);
    if (button) {
      return button;
    }
    button = this.config.buttons.find((b) => b.name === '*');
    if (button) {
      return button;
    }
    return undefined;
  }

  get openApiTags(): string[] {
    return [`Mode: ${this.config.name}`];
  }

  getOpenApiType(): Type | undefined {
    return getType<Mode>();
  }

  updateOpenApi(openApi: OpenApi): void {}

  handleWebRequest(req: Request, resp: Response, next: NextFunction): void {
    this.router(req, resp, next);
  }

  @Post('`${this.apiUrlPrefix}/button`')
  @OpenApiResponse(404, 'Button not found')
  async pressButton(@QueryParam({ enum: 'this.buttons' }) button: string): Promise<void> {
    this.debug('handle button press: %s', button);
    const buttonConfig = this.getButtonByName(button);
    if (!buttonConfig) {
      throw setStatusCodeOnError(new Error(`Could not find button: ${button}`), StatusCodes.NOT_FOUND);
    }
    const buttonActions = this.buttonActions[buttonConfig.name];
    if (!buttonActions) {
      throw new Error(`could not find button actions: ${buttonConfig.name}`);
    }
    for (const action of buttonActions) {
      await action.execute(button);
    }
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get buttons(): string[] {
    return this.config.buttons.flatMap((button) => {
      if (button.name === '*' && button.actions.length === 1 && button.actions[0]?.type === 'forwardToDevice') {
        const deviceId = (button.actions[0] as ForwardToDeviceActionConfig).deviceId;
        const device = this.server.devices.find((d) => d.id === deviceId);
        if (!device) {
          throw new Error(`could not find device with id: ${deviceId}`);
        }
        return device.buttons.filter((deviceButton) => !this.config.buttons.find((b) => b.name === deviceButton));
      }
      return [button.name];
    });
  }

  get urlPrefix(): string {
    return `/mode/${this.id}`;
  }

  get apiUrlPrefix(): string {
    return `/api/v1/mode/${this.id}`;
  }
}
