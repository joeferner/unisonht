import { UnisonHT } from "./UnisonHT";
import {
  LircRemote,
  LircRxModule,
  LircTxModule,
  PioneerRemote,
  findRcDeviceLircDevDir,
  getRcDevices,
} from "./devices/ir";

const REMOTE_TV = "tv";

async function run(): Promise<void> {
  const port = process.env.PORT || 8080;

  const remotes: LircRemote[] = [new PioneerRemote(REMOTE_TV)];

  const rcDevices = await getRcDevices();
  const lircRxDevice = findRcDeviceLircDevDir(rcDevices, "gpio_ir_recv", 0);
  if (!lircRxDevice) {
    throw new Error("could not find lirc rx device");
  }

  const lircTxDevice = findRcDeviceLircDevDir(rcDevices, "gpio-ir-tx", 0);
  if (!lircTxDevice) {
    throw new Error("could not find lirc tx device");
  }

  const unisonht = new UnisonHT();
  unisonht.use(new LircRxModule(lircRxDevice, { remotes }));
  unisonht.use(new LircTxModule(lircTxDevice, { remotes }));
  unisonht.start({ port }).then(() => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

run().catch((err) => console.error(err));
