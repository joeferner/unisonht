import { UnisonHTServer } from "../UnisonHTServer";
import yargs from "yargs";
import { WebInterfaceDeviceFactory } from "../plugins/web-interface/WebInterfaceDeviceFactory";
import fs from "fs";
import { DebugNodeFactory } from "../plugins/DebugNodeFactory";
import { ModeSwitchNodeFactory } from "../plugins/ModeSwitchNodeFactory";
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
  server.addDeviceFactory(new WebInterfaceDeviceFactory());
  server.addNodeFactory(new DebugNodeFactory());
  server.addNodeFactory(new ModeSwitchNodeFactory());
  server.start({ port: args.port });
}

run();
