import appRoot from "app-root-path";
import ejs from "ejs";
import fs from "fs";
import path from "path";

export async function renderEjs(templatePath: string, args: ejs.Data): Promise<string> {
  const absolutePath = path.join(appRoot.path, templatePath);
  const template = ejs.compile(await fs.promises.readFile(absolutePath, "utf8"), {
    filename: absolutePath,
    cache: process.env.NODE_ENV === "prod",
  });
  return template(args);
}
