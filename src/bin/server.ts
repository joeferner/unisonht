import { Server } from "../server";
import yargs from "yargs";

const args = yargs
  .option("port", {
    alias: "p",
    default: 4201,
    type: "number",
  })
  .parse();

new Server().start({ port: args.port });
