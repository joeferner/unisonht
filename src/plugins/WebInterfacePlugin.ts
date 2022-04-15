import { IUnisonHTPlugin, PluginOptions } from "../types/IUnisonHTPlugin";
import { OpenApi } from "../types/openApi/v3/OpenApi";
import { OpenApiResponse } from "../types/openApi/v3/OpenApiResponse";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UnisonHTNodeConfig } from "../types/UnisonHTConfig";
import { UnisonHTNode } from "../types/UnisonHTNode";
import { UnisonHTServer } from "../UnisonHTServer";

export class WebInterfacePlugin implements IUnisonHTPlugin {
  get id(): string {
    return "unisonht:web-interface";
  }

  get urlPrefix(): string {
    return `/api/${this.id.replace(/:/g, "/")}/`;
  }

  createNode(
    config: UnisonHTNodeConfig,
    options: PluginOptions
  ): Promise<UnisonHTNode> {
    return Promise.resolve(new WebInterfaceNode(this, config, options.server));
  }
}

export class WebInterfaceNode implements UnisonHTNode {
  constructor(
    private readonly plugin: WebInterfacePlugin,
    private readonly _config: UnisonHTNodeConfig,
    private readonly server: UnisonHTServer
  ) {}

  get id(): string {
    return this.config.id;
  }

  get config(): UnisonHTNodeConfig {
    return this._config;
  }

  get urlPrefix(): string {
    const remoteName = this.nameToUrl(this.configData.name);
    return `${this.plugin.urlPrefix}${remoteName}/`;
  }

  get configData(): WebInterfacePluginNodeData {
    return this.config.data as WebInterfacePluginNodeData;
  }

  updateSwaggerJson(swaggerJson: OpenApi, options: PluginOptions): void {
    const response: OpenApiResponse = {
      description: "Button pressed successfully",
    };
    for (const button of this.configData.buttons) {
      swaggerJson.paths[this.toPath(button)] = {
        post: {
          responses: {
            "204": response,
          },
          tags: [this.plugin.id],
        },
      };
    }
  }

  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: PluginOptions
  ): void {
    if (req.url.startsWith(this.plugin.urlPrefix)) {
      for (const button of this.configData.buttons) {
        if (req.url === this.toPath(button)) {
          this.handleButtonWebRequest(req, resp, button);
          return;
        }
      }
    }

    next();
  }

  private async handleButtonWebRequest(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    button: WebInterfacePluginNodeDataButton
  ): Promise<void> {
    for (const output of this.configData.outputs) {
      if (output.values.includes(button.value)) {
        await this.emitOutput(output.name, button.value);
      }
    }
    resp.statusCode = 204;
    resp.end();
  }

  private emitOutput(name: string, value: string): Promise<void> {
    return this.server.emitMessage(this, name, { value });
  }

  private toPath(button: WebInterfacePluginNodeDataButton): string {
    const buttonName = this.nameToUrl(button.name);
    return `${this.urlPrefix}${buttonName}`;
  }

  private nameToUrl(name: string): string {
    return name.replace(" ", "_").toLocaleLowerCase();
  }
}

export interface WebInterfacePluginNodeData {
  name: string;
  buttons: WebInterfacePluginNodeDataButton[];
  outputs: WebInterfacePluginNodeDataOutput[];
}

export interface WebInterfacePluginNodeDataButton {
  name: string;
  value: string;
}

export interface WebInterfacePluginNodeDataOutput {
  name: string;
  values: string[];
}
