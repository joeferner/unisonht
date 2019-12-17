import { GenericMode, UnisonHT } from './unisonht';
import { PioneerIrTv } from './pioneer-ir-tv';
import { DenonRs232Avr } from './denon-rs232-avr';
import { Roku } from './roku';

const PORT = 8080;

async function start(): Promise<void> {
  try {
    const tv = new PioneerIrTv('TV');
    const receiver = new DenonRs232Avr('Receiver');
    const roku = new Roku('Roku');

    await new UnisonHT()
      .addDevice(tv)
      .addDevice(receiver)
      .addDevice(roku)
      .addMode(new GenericMode({
        name: 'Off',
        devices: [],
      }))
      .addMode(new GenericMode({
        name: 'TV',
        devices: [tv, receiver, roku],
      }))
      .start({
        initialMode: 'Off',
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
