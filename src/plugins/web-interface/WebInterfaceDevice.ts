import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { OpenApi } from "../../types/openApi/v3/OpenApi";
import { OpenApiResponse } from "../../types/openApi/v3/OpenApiResponse";
import {
  UnisonHTDeviceConfig,
  UnisonHTNodeConfig,
} from "../../types/UnisonHTConfig";
import { UnisonHTDevice } from "../../types/UnisonHTDevice";
import { CreateNodeOptions } from "../../types/UnisonHTDeviceFactory";
import { UnisonHTNode } from "../../types/UnisonHTNode";
import { UnisonHTServer } from "../../UnisonHTServer";
import { nameToUrl } from "./utils";
import { WebInterfaceNode } from "./WebInterfaceNode";
import {
  WebInterfaceDeviceData,
  WebInterfaceDeviceDataButton,
} from "./WebInterfaceTypes";

export class WebInterfaceDevice implements UnisonHTDevice {
  private readonly html: string;

  constructor(
    private readonly server: UnisonHTServer,
    private readonly _config: UnisonHTDeviceConfig
  ) {
    this.html = this.createHtml();
  }

  get id(): string {
    return this.config.id;
  }

  get config(): UnisonHTDeviceConfig {
    return this._config;
  }

  get name(): string {
    return this.config.name ?? this.config.id;
  }

  get urlPrefix(): string {
    const remoteName = nameToUrl(this.name);
    return `/api/${this.id.replace(/:/g, "/")}/${remoteName}/`;
  }

  get configData(): WebInterfaceDeviceData {
    return this.config.data as WebInterfaceDeviceData;
  }

  createNode(
    config: UnisonHTNodeConfig,
    _options: CreateNodeOptions
  ): Promise<UnisonHTNode> {
    return Promise.resolve(new WebInterfaceNode(this.server, config));
  }

  private getButtonUrl(button: WebInterfaceDeviceDataButton): string {
    const buttonName = nameToUrl(button.name);
    return `${this.urlPrefix}${buttonName}`;
  }

  updateSwaggerJson(swaggerJson: OpenApi, options: CreateNodeOptions): void {
    const response: OpenApiResponse = {
      description: "Button pressed successfully",
    };
    for (const button of this.configData.buttons) {
      swaggerJson.paths[this.getButtonUrl(button)] = {
        post: {
          responses: {
            [StatusCodes.NO_CONTENT]: response,
          },
          tags: [this.id],
        },
      };
    }
  }

  handleWebRequest?(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    resp: Response<any, Record<string, any>, number>,
    next: NextFunction,
    options: CreateNodeOptions
  ): void {
    if (req.url.startsWith(this.urlPrefix)) {
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
    button: WebInterfaceDeviceDataButton
  ): Promise<void> {
    for (const node of this.server.getNodesByDeviceId(this.id)) {
      const webInterfaceNode = node as WebInterfaceNode;
      await webInterfaceNode.handleButtonPress(button.value);
    }
    resp.statusCode = StatusCodes.NO_CONTENT;
    resp.end();
  }

  private createHtml(): string {
    const buttonRows: WebInterfaceDeviceDataButton[][] = [];
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
          <title>UnisonHT: Remote: ${this.name}</title>
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
