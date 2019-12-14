import { UnisonHT } from './unisonht/UnisonHT';
import { PioneerIrTv } from './pioneer-ir-tv';
import { DenonRs232Avr } from './denon-rs232-avr';
import { StandardMode } from './unisonht';
import { Roku } from './roku';

const PORT = 8080;

async function start(): Promise<void> {
  try {
    const tv = new PioneerIrTv();
    const receiver = new DenonRs232Avr();
    const roku = new Roku();

    await new UnisonHT()
      .addDevice(tv)
      .addMode(new StandardMode({
        name: 'off',
        devices: [],
      }))
      .addMode(new StandardMode({
        name: 'tv',
        devices: [tv, receiver, roku],
      }))
      .start({
        initialMode: 'off',
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
