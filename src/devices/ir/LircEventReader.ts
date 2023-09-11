import events from "events";
import fs from "fs";
import ioctl from "ioctl";
import { NestedError } from "../../helpers/NestedError";
import { _IOR, _IOW } from "../../helpers/ioctlHelpers";

const SCAN_CODE_SIZE = (64 + 16 + 16 + 32 + 64) / 8;

export enum LircProto {
  Unknown = 0,
  Other = 1,
  RC5 = 2,
  RC5X_20 = 3,
  RC5_SZ = 4,
  JVC = 5,
  Sony12 = 6,
  Sony15 = 7,
  Sony20 = 8,
  NEC = 9,
  NECX = 10,
  NEC32 = 11,
  SANYO = 12,
  MCIR2_KBD = 13,
  MCIR2_MSE = 14,
  RC6_0 = 15,
  RC6_6A_20 = 16,
  RC6_6A_24 = 17,
  RC6_6A_32 = 18,
  RC6_MCE = 19,
  SHARP = 20,
  XMP = 21,
  CEC = 22,
  IMON = 23,
  RCMM12 = 24,
  RCMM24 = 25,
  RCMM32 = 26,
  XBOX_DVD = 27,
}

export interface LircEvent {
  timestamp: bigint;
  flags: number;
  rcProto: LircProto | number;
  keycode: number;
  scanCode: bigint;
}

export enum LircIoCtlCommand {
  GetFeatures = _IOR("i", 0x00000000, 4),
  SetReceiveMode = _IOW("i", 0x00000012, 4),
  SetReceiveCarrier = _IOW("i", 0x00000014, 4),
  SetReceiveCarrierRange = _IOW("i", 0x0000001f, 4),
}

export enum LircMode {
  Raw = 0x00000001,
  Pulse = 0x00000002,
  Mode2 = 0x00000004,
  ScanCode = 0x00000008,
  LIRCCode = 0x00000010,
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface LircEventReader {
  on(event: "input", listener: (event: InputEvent) => void): this;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class LircEventReader extends events.EventEmitter {
  private fd?: fs.promises.FileHandle;

  public async open(path: string): Promise<void> {
    if (this.fd) {
      throw new Error("lirc device already open");
    }
    this.fd = await fs.promises.open(path, "r");
    const _features = await this.readIoctl32(LircIoCtlCommand.GetFeatures);
    await this.writeIoctl32(LircIoCtlCommand.SetReceiveMode, LircMode.ScanCode);
    setTimeout(() => {
      this.read();
    });
  }

  public async close(): Promise<void> {
    await this.fd?.close();
    this.fd = undefined;
  }

  private async readIoctl32(cmd: LircIoCtlCommand): Promise<number> {
    if (!this.fd) {
      throw new Error("device not open");
    }
    const v = Buffer.alloc(4);
    try {
      if (ioctl(this.fd.fd, cmd, v) !== 0) {
        throw new Error("failed to set receive mode");
      }
    } catch (err) {
      throw NestedError(`failed to ioctl (cmd: 0x${cmd.toString(16)})`, err);
    }
    return v.readUInt32LE(0);
  }

  private async writeIoctl32(cmd: LircIoCtlCommand, value: number): Promise<void> {
    if (!this.fd) {
      throw new Error("device not open");
    }
    const v = Buffer.alloc(4);
    v.writeUInt32LE(value, 0);
    try {
      if (ioctl(this.fd.fd, cmd, v) !== 0) {
        throw new Error("failed to set receive mode");
      }
    } catch (err) {
      throw NestedError(`failed to ioctl (cmd: 0x${cmd.toString(16)}, value: 0x${value.toString(16)})`, err);
    }
  }

  private async read(): Promise<void> {
    if (!this.fd) {
      return;
    }
    const buffer = Buffer.alloc(SCAN_CODE_SIZE * 64);
    try {
      const packet = await this.fd.read(buffer, 0, buffer.length);
      this.decodeAndEmitPacket(packet);
      this.read();
    } catch (err) {
      console.error(err);
    }
  }

  private decodeAndEmitPacket(packet: fs.promises.FileReadResult<Buffer>): void {
    for (let offset = 0; offset < packet.bytesRead; offset += SCAN_CODE_SIZE) {
      const timestamp = packet.buffer.readBigUInt64LE(offset + 0);
      const flags = packet.buffer.readUInt16LE(offset + 8);
      const rcProto = packet.buffer.readUInt16LE(offset + 10);
      const keycode = packet.buffer.readUInt32LE(offset + 12);
      const scanCode = packet.buffer.readBigUInt64LE(offset + 16);
      const event: LircEvent = {
        timestamp,
        flags,
        rcProto,
        keycode,
        scanCode,
      };
      this.emit("input", event);
    }
  }
}
