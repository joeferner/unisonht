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

export class Mode {
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

  protected get swaggerTags(): string[] {
    return [`Mode: ${this.config.name}`];
  }

  updateSwaggerJson(swaggerJson: OpenApi): void {
    swaggerJson.paths[`${this.apiUrlPrefix}/button`] = {
      post: {
        operationId: 'pressButton',
        tags: this.swaggerTags,
        parameters: [
          {
            in: 'query',
            name: 'button',
            required: true,
            schema: {
              type: 'string',
              enum: this.buttons,
            },
          },
        ],
        responses: {
          [200]: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
          [404]: {
            description: 'Button not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    };
  }

  handleWebRequest(req: Request, resp: Response, next: NextFunction): void {
    this.router(req, resp, next);
  }

  async pressButton(buttonName: string): Promise<void> {
    this.debug('handle button press: %s', buttonName);
    const buttonConfig = this.getButtonByName(buttonName);
    if (!buttonConfig) {
      throw setStatusCodeOnError(new Error(`Could not find button: ${buttonName}`), StatusCodes.NOT_FOUND);
    }
    const buttonActions = this.buttonActions[buttonConfig.name];
    for (const action of buttonActions) {
      await action.execute(buttonName);
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
      if (button.name === '*' && button.actions.length === 1 && button.actions[0].type === 'forwardToDevice') {
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

  protected get urlPrefix(): string {
    return `/mode/${this.id}`;
  }

  protected get apiUrlPrefix(): string {
    return `/api/v1/mode/${this.id}`;
  }
}
