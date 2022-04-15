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
    return Promise.resolve(new WebInterfaceNode(this, config));
  }
}

export class WebInterfaceNode implements UnisonHTNode {
  private readonly plugin: WebInterfacePlugin;
  private readonly config: UnisonHTNodeConfig;

  constructor(plugin: WebInterfacePlugin, config: UnisonHTNodeConfig) {
    this.plugin = plugin;
    this.config = config;
  }

  get urlPrefix(): string {
    const data = this.config.data as WebInterfacePluginNodeData;
    const remoteName = this.nameToUrl(data.name);
    return `${this.plugin.urlPrefix}${remoteName}/`;
  }

  updateSwaggerJson(swaggerJson: OpenApi, options: PluginOptions): void {
    const data = this.config.data as WebInterfacePluginNodeData;
    const response: OpenApiResponse = {
      description: "Button pressed successfully",
    };
    for (const button of data.buttons) {
      swaggerJson.paths[this.toPath(data, button)] = {
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
      const data = this.config.data as WebInterfacePluginNodeData;
      for (const button of data.buttons) {
        if (req.url === this.toPath(data, button)) {
          // TODO emit value
          resp.statusCode = 204;
          resp.end();
          return;
        }
      }
    }

    next();
  }

  private toPath(
    data: WebInterfacePluginNodeData,
    button: WebInterfacePluginNodeDataButton
  ): string {
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
}

export interface WebInterfacePluginNodeDataButton {
  name: string;
  value: string;
}
