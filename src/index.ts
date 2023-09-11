import express, { Request, Response } from "express";
import { LircEventReader } from "./devices/ir/LircEventReader";
import { findRcDeviceLircDevDir, getRcDevices } from "./devices/ir/RcDevices";
import { LircEventWriter } from "./devices/ir/LircEventWriter";
import { LircProto } from "./devices/ir/lirc";

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function doIt(): Promise<void> {
  const rcDevices = await getRcDevices();
  const lircRxDevice = findRcDeviceLircDevDir(rcDevices, "gpio_ir_recv", 0);
  if (!lircRxDevice) {
    throw new Error("could not find lirc rx device");
  }

  const lircTxDevice = findRcDeviceLircDevDir(rcDevices, "gpio-ir-tx", 0);
  if (!lircTxDevice) {
    throw new Error("could not find lirc tx device");
  }

  const rx = new LircEventReader();
  rx.on("input", (evt) => {
    console.log(evt);
  });
  await rx.open(lircRxDevice);

  const tx = new LircEventWriter();
  await tx.open(lircTxDevice);

  for (let i = 0; i < 2; i++) {
    tx.send(LircProto.NEC, 43521);
  }
  tx.close();
}
doIt()
  .then(() => console.log("reading"))
  .catch((err) => console.error(err));
