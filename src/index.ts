import express, { Request, Response } from "express";
import { LircEventReader } from "./devices/ir/LircEventReader";
import { findRcDeviceLircDevDir, getRcDevices } from "./devices/ir/RcDevices";

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
  const lircDevice = findRcDeviceLircDevDir(rcDevices, "gpio_ir_recv", 0);
  if (!lircDevice) {
    return;
  }

  const r = new LircEventReader();
  r.on("input", (evt) => {
    console.log(evt);
  });
  await r.open(lircDevice);
}
doIt()
  .then(() => console.log("reading"))
  .catch((err) => console.error(err));
