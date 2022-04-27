import { UnisonHTServer } from "../UnisonHTServer";
import yargs from "yargs";
import fs from "fs";
import ConfigTypeInfo from "../../dist/Config-ti";
import { createCheckers } from "ts-interface-checker";
import { MockDeviceFactory } from "../devices/MockDevice";
import { MockIrTxRxFactory } from "../ir/MockIrTxRx";

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
  const typeCheckers = createCheckers(ConfigTypeInfo);
  typeCheckers.Config.check(config);

  const server = new UnisonHTServer(config);
  server.addDeviceFactory(new MockDeviceFactory());
  server.addIrTxRxFactory(new MockIrTxRxFactory());
  server.start({ port: args.port });
}

run();
