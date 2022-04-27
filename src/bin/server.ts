import { UnisonHTServer } from "../UnisonHTServer";
import yargs from "yargs";
import fs from "fs";
import { MockDeviceFactory } from "../devices/MockDevice";
import { MockPluginFactory } from "../plugins/MockPlugin";
import { validateConfig } from "../types/TypeUtils";

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
  validateConfig(config);

  const server = new UnisonHTServer(config);
  server.addDeviceFactory(new MockDeviceFactory());
  server.addPluginFactory(new MockPluginFactory());
  server.start({ port: args.port });
}

run();
