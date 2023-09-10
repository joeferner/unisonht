import express, { Request, Response } from "express";
import { InputEventReader } from "./devices/ir/InputEventReader";

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function doIt(): Promise<void> {
  const r = new InputEventReader();
  r.on('input', (evt) => {
    console.log(evt);
  });
  await r.open('/dev/input/event0');
}
doIt().then(() => console.log('reading')).catch(err => console.error(err));