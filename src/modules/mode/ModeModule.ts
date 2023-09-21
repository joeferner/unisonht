import root from "app-root-path";
import debug from "debug";
import { Request, Response } from "express";
import { OpenAPI } from "openapi-types";
import path from "path";
import { UnisonHT } from "../../UnisonHT";
import { GetHtmlParams, UnisonHTModule } from "../../UnisonHTModule";
import { EventEmitter } from "../../helpers/EventEmitter";
import { isString } from "../../helpers/typeHelpers";
import { modePage } from "./pages/modePage";
import { renderJSXElement } from "../../helpers/jsx";

const log = debug("unisonht:ModeModule");

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface ModeModule {
  on(event: "modeSwitch", listener: (event: ModeSwitchEvent) => void): this;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ModeModule extends EventEmitter<"modeSwitch"> implements UnisonHTModule {
  public static readonly DEFAULT_NAME = "mode";

  private readonly _name: string;
  private readonly _displayName: string;
  private readonly _modes: string[];
  private _currentMode: string;

  public constructor(options: ModeModuleOptions) {
    super();
    this._name = options.name ?? ModeModule.DEFAULT_NAME;
    this._displayName = options.displayName ?? options.name ?? "Mode";
    this._currentMode = options.currentMode;
    this._modes = options.modes;
  }

  public get name(): string {
    return this._name;
  }

  public get displayName(): string {
    return this._displayName;
  }

  public get currentMode(): string {
    return this._currentMode;
  }

  public get modes(): string[] {
    return this._modes;
  }

  public async init(unisonht: UnisonHT): Promise<void> {
    await unisonht.registerJavascriptPath(path.join(root.path, "build/modules/mode/pages/mode.js"));
    await unisonht.registerPostHandler(
      `/module/${this.name}/switch`,
      createSwitchModeOpenApi(this.modes),
      async (req: Request, res: Response): Promise<unknown> => {
        return this.handleSwitchModeRequest(req, res);
      },
    );
  }

  public async getHtml(_unisonht: UnisonHT, _params: GetHtmlParams): Promise<string> {
    return renderJSXElement(
      modePage({
        moduleName: this.name,
        currentMode: this.currentMode,
        modes: this.modes,
      }),
    );
  }

  private async handleSwitchModeRequest(req: Request, res: Response): Promise<unknown> {
    const mode = req.query["mode"];
    if (!mode) {
      return res.status(400).send('"mode" is required');
    }
    if (!isString(mode)) {
      return res.status(400).send('"mode" must be a string');
    }
    if (!this.modes.includes(mode)) {
      return res.status(404).send(`"${mode}" not found in modes`);
    }

    await this.switchModes(mode);
    return res.json({});
  }

  public async switchModes(newMode: string): Promise<void> {
    log(`switch mode "${this.currentMode}" to "${newMode}"`);
    const event: ModeSwitchEvent = {
      lastMode: this.currentMode,
      newMode: newMode,
    };
    await this.emit("modeSwitch", event);
    this._currentMode = newMode;
  }
}

export interface ModeModuleOptions {
  name?: string;
  displayName?: string;
  currentMode: string;
  modes: string[];
}

export interface ModeSwitchEvent {
  lastMode: string;
  newMode: string;
}

function createSwitchModeOpenApi(modes: string[]): OpenAPI.Operation {
  return {
    description: "Switch mode",
    parameters: [
      {
        name: "mode",
        in: "query",
        description: "The mode to switch to",
        schema: {
          type: "string",
          enum: modes,
        },
      },
    ],
  };
}
