import { GenericMode, sleep, UnisonHT } from './unisonht';
import { PioneerIrTv, PioneerIrTvInput } from './pioneer-ir-tv';
import { DenonRs232Avr } from './denon-rs232-avr';
import { Roku } from './roku';
import { StandardButton } from './unisonht/StandardButton';

const PORT = 8080;

const tv = new PioneerIrTv('TV');

const receiver = new DenonRs232Avr({
  name: 'Receiver',
  port: '/dev/ttyUSB0' // DenonRs232Avr.MOCK_PATH
});

const roku = new Roku({
  name: 'Roku',
  address: 'http://192.168.68.118:8060',
});

async function start(): Promise<void> {
  try {
    await new UnisonHT()
      .addDevice(tv)
      .addDevice(receiver)
      .addDevice(roku)
      .addMode(new GenericMode({
        name: 'Off',
        devices: [],
        buttons: {
          [StandardButton.POWER_ON]: setMode('TV'),
          [StandardButton.POWER_TOGGLE]: setMode('TV'),
        },
      }))
      .addMode(new GenericMode({
        name: 'TV',
        devices: [tv, receiver, roku],
        buttons: {
          [StandardButton.POWER_OFF]: setMode('Off'),
          [StandardButton.POWER_TOGGLE]: setMode('Off'),
          [StandardButton.VOLUME_UP]: async () => {
            await receiver.volumeUp();
            return true;
          },
          [StandardButton.VOLUME_DOWN]: async () => {
            await receiver.volumeDown();
            return true;
          },
        },
        onEnter: async (app) => {
          await sleep(3_000);
          await tv.setInput(PioneerIrTvInput.HDMI5);
        },
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

function setMode(mode: string): (app: UnisonHT) => Promise<boolean> {
  return async (app) => {
    await app.switchToMode(mode);
    return true;
  };
}

start();
