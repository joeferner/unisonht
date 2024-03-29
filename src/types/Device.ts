import Debug from 'debug';
import express from 'express';
import Router from 'express-promise-router';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { Type } from 'tst-reflect';
import { UnisonHTServer } from '../UnisonHTServer';
import { DeviceConfig } from './Config';
import { setStatusCodeOnError } from './ErrorWithStatusCode';
import { OpenApi } from './openApi/v3/OpenApi';
import { OpenApiProvider } from './OpenApiProvider';

export interface DeviceFactory<TConfigData> {
  createDevice(server: UnisonHTServer, config: DeviceConfig<TConfigData>): Promise<Device<TConfigData>>;
}

export abstract class Device<TConfigData> implements OpenApiProvider {
  protected readonly debug = Debug(`unisonht:unisonht:device:${this.name}:${this.id}`);
  protected readonly router: express.Router;

  constructor(protected readonly server: UnisonHTServer, protected readonly config: DeviceConfig<TConfigData>) {
    this.router = Router();
    this.router.post(`${this.apiUrlPrefix}/button`, async (req, res) => {
      if (!req.query.button) {
        throw setStatusCodeOnError(new Error("'button' is required"), StatusCodes.BAD_REQUEST);
      }
      await this.buttonPress(req.query.button?.toString());
      res.json({});
    });
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get openApiTags(): string[] {
    return [`Device: ${this.config.name}`];
  }

  getOpenApiType(): Type | undefined {
    return undefined;
  }

  updateOpenApi(openApi: OpenApi): void {
    openApi.paths[`${this.apiUrlPrefix}/button`] = {
      post: {
        operationId: 'pressButton',
        tags: this.openApiTags,
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
        },
      },
    };
  }

  handleWebRequest(req: Request, resp: Response, next: NextFunction): void {
    this.router(req, resp, next);
  }

  abstract buttonPress(button: string): Promise<void>;

  abstract switchMode(oldModeId: string | undefined, newModeId: string): Promise<void>;

  abstract switchInput(inputName: string): Promise<void>;

  protected shouldBeActiveForMode(modeId: string): boolean {
    return this.config.activeModeIds.includes(modeId) ?? false;
  }

  isActive(): boolean {
    return this.shouldBeActiveForMode(this.server.modeId ?? 'NOT SET');
  }

  abstract getPowerState(): Promise<PowerState>;

  abstract get buttons(): string[];

  get urlPrefix(): string {
    return `/device/${this.id}`;
  }

  get apiUrlPrefix(): string {
    return `/api/v1/device/${this.id}`;
  }
}

export enum PowerState {
  ON = 'ON',
  OFF = 'OFF',
}
