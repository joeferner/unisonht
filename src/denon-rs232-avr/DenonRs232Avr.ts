import { Device, DeviceInitOptions, DeviceStatus, UnisonHT, UnisonHTRequest } from '../unisonht';
import * as path from 'path';
import SerialPort from 'serialport';

export class DenonRs232Avr implements Device {
  private _name: string;
  private _port: string;
  private _publicPath: string;
  private _serialPort: SerialPort;
  private _incomingBuffer: string;

  constructor(options: DenonRs232AvrOptions) {
    this._name = options.name;
    this._port = options.port;
    this._publicPath = path.join(__dirname, '../../src/denon-rs232-avr/public/');
    this._serialPort = new SerialPort(this._port, {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      autoOpen: false,
    });
    this._incomingBuffer = '';
    this._serialPort.on('data', (data: Buffer) => {
      this._incomingBuffer += data.toString('utf8');
    });
  }

  get name() {
    return this._name;
  }

  async init(app: DeviceInitOptions): Promise<void> {
    await this.openPort();
  }

  async publicModulePath(app: UnisonHT): Promise<string> {
    return path.join(this._publicPath, 'Denon.jsx');
  }

  async getStatus(req: UnisonHTRequest): Promise<DenonStatus> {
    return {
      inputSource: await this.getInputSource(),
      surroundSetting: await this.getSurroundSetting(),
      masterVolume: await this.getMasterVolume(),
      power: await this.getPower(),
      mute: await this.getMute(),
    };
  }

  private async getInputSource(): Promise<InputSource> {
    const response = await this.sendCommand('SI?');
    if (!response) {
      throw new Error('no response');
    }
    if (!response.startsWith('SI')) {
      throw new Error(`Unexpected response ${response}`);
    }
    return response.substring('SI'.length) as InputSource;
  }

  private async getSurroundSetting(): Promise<SurroundSetting> {
    const response = await this.sendCommand('MS?');
    if (!response) {
      throw new Error('no response');
    }
    if (!response.startsWith('MS')) {
      throw new Error(`Unexpected response ${response}`);
    }
    return response.substring('MS'.length) as SurroundSetting;
  }

  private async getPower(): Promise<Power> {
    const response = await this.sendCommand('PW?');
    if (!response) {
      throw new Error('no response');
    }
    if (!response.startsWith('PW')) {
      throw new Error(`Unexpected response ${response}`);
    }
    return response.substring('PW'.length) as Power;
  }

  private async getMute(): Promise<boolean> {
    const response = await this.sendCommand('MU?');
    if (!response) {
      throw new Error('no response');
    }
    if (!response.startsWith('MU')) {
      throw new Error(`Unexpected response ${response}`);
    }
    const str = response.substring('MU'.length);
    if (str === 'ON') {
      return true;
    }
    if (str === 'OFF') {
      return true;
    }
    throw new Error(`Unexpected response ${response}`);
  }

  private async getMasterVolume(): Promise<number> {
    const response = await this.sendCommand('MV?');
    if (!response) {
      throw new Error('no response');
    }
    if (!response.startsWith('MV')) {
      throw new Error(`Unexpected response ${response}`);
    }
    const numberStr = response.substring('MV'.length);
    let result = parseInt(numberStr);
    if (numberStr.length === 3) {
      result = result / 10.0;
    }
    return result - 80.0;
  }

  async buttonPress(app: UnisonHT, button: string): Promise<void> {
    // TODO
  }

  private openPort(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._serialPort.open((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async sendCommand(command: string, timeout: number = 500): Promise<string | null> {
    this._incomingBuffer = '';
    await this.serialPortWrite(command + '\x0d');
    for (let i = 0; i < timeout; i++) {
      if (this._incomingBuffer.endsWith('\x0d')) {
        break;
      }
      await sleep(1);
    }
    return this._incomingBuffer.trim();
  }

  private async serialPortWrite(value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._serialPort.write(value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export interface DenonRs232AvrOptions {
  name: string;
  port: string;
}

async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export interface DenonStatus extends DeviceStatus {
  inputSource: InputSource;
  surroundSetting: SurroundSetting;
  masterVolume: number;
  power: Power;
  mute: boolean;
}

export enum InputSource {
  PHONO = 'PHONO',
  CD = 'CD',
  TUNER = 'TUNER',
  DVD = 'DVD',
  VDP = 'VDP',
  TV = 'TV',
  DBS_SAT = 'DBS/SAT',
  VCR1 = 'VCR-1',
  VCR2 = 'VCR-2',
  VCR3 = 'VCR-3',
  VAUX = 'V.AUX',
  CDR_TAPE1 = 'CDR/TAPE1',
  MD_TAPE2 = 'CR/TAPE2'
}

export enum SurroundSetting {
  DIRECT = 'DIRECT',
  PURE_DIRECT = 'PURE DIRECT',
  STEREO = 'STEREO'
}

export enum Power {
  ON = 'ON',
  STANDBY = 'STANDBY'
}