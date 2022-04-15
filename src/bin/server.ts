import { Server } from "../server";
import yargs from "yargs";
import { WebInterfacePlugin } from "../plugins/WebInterfacePlugin";
import fs from "fs";

async function run() {
  const args = await yargs
    .option("port", {
      alias: "p",
      default: 4201,
      type: "number",
    })
    .option("config", {
      alias: "c",
      type: "string",
      demandOption: true,
    })
    .parse();

  const config = JSON.parse(await fs.promises.readFile(args.config, "utf-8"));

  const server = new Server(config);
  server.addPlugin(new WebInterfacePlugin());
  server.start({ port: args.port });
}

run();
