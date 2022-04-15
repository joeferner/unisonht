import { UnisonHTServer } from "../UnisonHTServer";
import yargs from "yargs";
import { WebInterfacePlugin } from "../plugins/WebInterfacePlugin";
import fs from "fs";
import { DebugPlugin } from "../plugins/DebugPlugin";
import { ModeSwitchPlugin } from "../plugins/ModeSwitchPlugin";
import UnisonHTConfigTypeInfo from "../../dist/UnisonHTConfig-ti";
import { createCheckers } from "ts-interface-checker";

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
  const typeCheckers = createCheckers(UnisonHTConfigTypeInfo);
  typeCheckers.UnisonHTConfig.check(config);

  const server = new UnisonHTServer(config);
  server.addPlugin(new WebInterfacePlugin());
  server.addPlugin(new DebugPlugin());
  server.addPlugin(new ModeSwitchPlugin());
  server.start({ port: args.port });
}

run();
