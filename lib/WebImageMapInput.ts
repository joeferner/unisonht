import {UnisonHT} from "./UnisonHT";
import {Input} from "./Input";
import {UnisonHTResponse} from "./UnisonHTResponse";
import * as express from "express";
import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";

export class WebImageMapInput extends Input {
  private static template: ejs.TemplateFunction;

  constructor(inputName: string, options: WebImageMapInput.Options) {
    super(inputName, options);
    if (!WebImageMapInput.template) {
      const template = fs.readFileSync(path.join(__dirname, 'WebImageMapInput.ejs'), 'utf8');
      WebImageMapInput.template = ejs.compile(template);
    }
  }

  start(unisonht: UnisonHT): Promise<void> {
    return super.start(unisonht)
      .then(() => {
        unisonht.getApp().get(`${this.getPathPrefix()}/ui`, this.handleUI.bind(this));
        unisonht.getApp().get(`${this.getPathPrefix()}/image`, this.handleImage.bind(this));
      });
  }

  private handleUI(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    const options = {
      title: this.getInputName(),
      imagePath: `${this.getPathPrefix()}/image`,
      buttonMap: this.getOptions().buttonMap
    };
    res.write(WebImageMapInput.template(options));
  }

  private handleImage(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    res.sendFile(this.getOptions().imageFilename);
  }

  protected getOptions(): WebImageMapInput.Options {
    return <WebImageMapInput.Options>super.getOptions();
  }
}

export module WebImageMapInput {
  export interface ButtonMapItem {
    coords: number[];
  }

  export interface Options extends Input.Options {
    imageFilename: string;
    buttonMap: {[key: string]: ButtonMapItem;};
  }
}
