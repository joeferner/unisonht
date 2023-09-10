import express, { Request, Response } from "express";
import { InputEventReader } from "./devices/ir/InputEventReader";
import { findRcDeviceInputEventPath, getRcDevices } from "./devices/ir/RcDevices";

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
  const eventDevice = findRcDeviceInputEventPath(rcDevices, "gpio_ir_recv", 0, 0);
  if (!eventDevice) {
    return;
  }

  const r = new InputEventReader();
  r.on("input", (evt) => {
    console.log(evt);
  });
  await r.open(eventDevice);
}
doIt()
  .then(() => console.log("reading"))
  .catch((err) => console.error(err));
