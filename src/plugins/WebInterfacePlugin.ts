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
import WebInterfacePluginNodeDataTypeInfo from "../../dist/WebInterfacePlugin-ti";
import { createCheckers } from "ts-interface-checker";
import { StatusCodes } from "http-status-codes";

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
  private readonly html: string;

  constructor(
    private readonly plugin: WebInterfacePlugin,
    private readonly _config: UnisonHTNodeConfig,
    private readonly server: UnisonHTServer
  ) {
    const typeCheckers = createCheckers(WebInterfacePluginNodeDataTypeInfo);
    typeCheckers.WebInterfacePluginNodeData.check(_config.data);

    this.html = this.createHtml();
  }

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
      swaggerJson.paths[this.getButtonUrl(button)] = {
        post: {
          responses: {
            [StatusCodes.NO_CONTENT]: response,
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
        if (req.method === "POST" && req.url === this.getButtonUrl(button)) {
          this.handleButtonWebRequest(req, resp, button);
          return;
        }
      }
    }

    if (req.method === "GET" && this.configData.url === req.url) {
      resp.type("html").send(this.html);
      return;
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
    resp.statusCode = StatusCodes.NO_CONTENT;
    resp.end();
  }

  private emitOutput(name: string, value: string): Promise<void> {
    return this.server.emitMessage(this, name, { value });
  }

  private getButtonUrl(button: WebInterfacePluginNodeDataButton): string {
    const buttonName = this.nameToUrl(button.name);
    return `${this.urlPrefix}${buttonName}`;
  }

  private nameToUrl(name: string): string {
    return name.replace(" ", "_").toLocaleLowerCase();
  }

  private createHtml(): string {
    const buttonRows: WebInterfacePluginNodeDataButton[][] = [];
    for (const button of this.configData.buttons) {
      buttonRows[button.row] = buttonRows[button.row] || [];
      buttonRows[button.row].push(button);
    }

    const rows: string[] = buttonRows.map((buttonRow) => {
      const rowHtml = buttonRow
        .sort((a, b) => a.column - b.column)
        .map((button) => {
          return `<button style="width: ${
            button.width * 100
          }%;" onclick="handleButtonClick('${this.getButtonUrl(button)}')">${
            button.name
          }</button>`;
        })
        .join("\n");
      return `<div>${rowHtml}</div>`;
    });

    return `<html>
      <head>
        <title>UnisonHT: Remote: ${this.configData.name}</title>
        <style>
          body {
            color: #fff;
            background-color: #000;
          }

          .wrapper {
            max-width: 500px;
          }

          .header {
            display: flex;
            height: 20px;
          }

          #mode {
            width: 30%;
          }

          #tx {
            width: 30%;
            text-align: center;
            color: #f00;
          }

          .transmitting {
            padding: 2px;
          }
          
          .transmitting, .transmitting:before {
            display: inline-block;
            border: 6px double transparent;
            border-top-color: currentColor;
            border-radius: 50%;
          }
          
          .transmitting:before {
            content: '';
            width: 0; height: 0;
          }

          button {
            width: 30%;
            height: 50px;
            margin: 10px;
            background-color: #000;
            color: #fff;
            border: 1px solid #fff;
          }
        </style>
        <script type="text/javascript">
          function handleButtonClick(url) {
            const endTime = Date.now() + 500;
            document.getElementById('tx').innerHTML = '<div class="transmitting"></div>';
            fetch(url, {
              method: "POST",
              headers: {'Content-Type': 'application/json'}, 
              body: JSON.stringify({})
            }).then(() => {
              refresh();
            }).catch(err => {
              alert('failed: ' + err);
            }).finally(() => {
              setTimeout(() => {
                document.getElementById('tx').innerHTML = '';
              }, Math.max(0, endTime - Date.now()));
            });
          }

          function refresh() {
            fetch("/api/mode", {method:"GET"})
              .then(res => res.json())
              .then(res => document.getElementById('mode').innerText = res.mode)
              .catch(err => {
                console.error(err);
                document.getElementById('mode').innerText = 'ERR';
              });
          }

          refresh();
        </script>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div id="mode">???</div>
            <div id="tx"></div>
          </div>
          ${rows.join("\n")}
        </div>
      </body>
    </html>`;
  }
}

export interface WebInterfacePluginNodeData {
  name: string;
  url: string;
  buttons: WebInterfacePluginNodeDataButton[];
  outputs: WebInterfacePluginNodeDataOutput[];
}

export interface WebInterfacePluginNodeDataButton {
  name: string;
  value: string;
  row: number;
  column: number;
  width: number;
}

export interface WebInterfacePluginNodeDataOutput {
  name: string;
  values: string[];
}
