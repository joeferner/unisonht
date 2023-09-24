import spi, { SpiDevice, SpiMessage, SpiOptions } from "spi-device";

// https://docs.openenergymonitor.org/electricity-monitoring/ct-sensors/interface-with-arduino.html

const COM_SPEED_HZ = 20000;

export class Mcp3204 {
  public static readonly MAX_VALUE = 4096;
  private device?: SpiDevice;

  public async open(): Promise<void> {
    const spiOptions: SpiOptions = {
      mode: 0,
      chipSelectHigh: false,
      lsbFirst: false,
      threeWire: false,
      loopback: false,
      noChipSelect: false,
      ready: false,
      bitsPerWord: 8,
      maxSpeedHz: COM_SPEED_HZ,
    };
    this.device = await openSpiDevice(0, 0, spiOptions);
  }

  public async readSingle(channel: number): Promise<number> {
    if (!this.device) {
      throw new Error("spi device not open");
    }
    if (channel < 0 || channel > 3) {
      throw new Error("invalid channel, expected 0, 1, 2, 3");
    }
    const message = Buffer.from([0b1100_0000 | (channel << 3), 0x00, 0x00]);
    const result = await spiTransfer(this.device, message);
    return ((result[0] << 16) | (result[1] << 8) | result[2]) >> 5;
  }
}

function openSpiDevice(busNumber: number, deviceNumber: number, options: SpiOptions): Promise<SpiDevice> {
  return new Promise((resolve, reject) => {
    const d: SpiDevice = spi.open(busNumber, deviceNumber, options, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(d);
    });
  });
}

function spiTransfer(device: SpiDevice, message: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const txMessage: SpiMessage = [
      {
        sendBuffer: message,
        receiveBuffer: Buffer.alloc(message.length),
        byteLength: message.length,
        bitsPerWord: 8,
        chipSelectChange: false,
        microSecondDelay: 0,
        speedHz: COM_SPEED_HZ,
      },
    ];
    device.transfer(txMessage, (err, rxMessage) => {
      if (err) {
        return reject(err);
      }
      const rx = rxMessage[0].receiveBuffer;
      if (!rx) {
        return reject(new Error("missing receiveBuffer"));
      }
      return resolve(rx);
    });
  });
}
