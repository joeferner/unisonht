import { UnisonHT } from './unisonht/UnisonHT';
import { PioneerIrTv } from './pioneer-ir-tv/PioneerIrTv';

const PORT = 8080;

async function start(): Promise<void> {
  try {
    await new UnisonHT()
      .addDevice(new PioneerIrTv())
      .start({
        http: {
          port: PORT,
        },
      });
    console.log(`Listening http://localhost:${PORT}`);
  } catch (err) {
    console.error('failed to start', err);
    process.exit(1);
  }
}

start();
