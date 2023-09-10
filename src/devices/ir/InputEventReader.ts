import events from "events";
import fs from "fs";
import { readUInt64LE } from "../../helpers/bufferHelpers";
import { InputEventKey } from "./InputEventKey";

export enum InputEventType {
  EV_SYN = 0x00,
  EV_KEY = 0x01,
  EV_REL = 0x02,
  EV_ABS = 0x03,
  EV_MSC = 0x04,
  EV_SW = 0x05,
  EV_LED = 0x11,
  EV_SND = 0x12,
  EV_REP = 0x14,
  EV_FF = 0x15,
  EV_PWR = 0x16,
  EV_FF_STATUS = 0x17,
}

export enum InputEventSynValue {
  SYN_REPORT = 0,
  SYN_CONFIG = 1,
  SYN_MT_REPORT = 2,
  SYN_DROPPED = 3,
}

export interface InputEventRaw {
  timeS: number;
  timeMS: number;
  type: InputEventType | number;
  code: number;
  value: number;
}

export interface InputEventSyn {
  timeS: number;
  timeMS: number;
  type: InputEventType.EV_SYN;
  code: InputEventSynValue | number;
  value: number;
}

export interface InputEventMsc {
  timeS: number;
  timeMS: number;
  type: InputEventType.EV_MSC;
  code: InputEventKey | number;
  value: number;
}

export type InputEvent = InputEventRaw | InputEventSyn | InputEventMsc;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface InputEventReader {
  on(event: "input", listener: (event: InputEvent) => void): this;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class InputEventReader extends events.EventEmitter {
  private fd?: fs.promises.FileHandle;

  public async open(path: string): Promise<void> {
    if (this.fd) {
      throw new Error("input device already open");
    }
    this.fd = await fs.promises.open(path, "r");
    setTimeout(() => {
      this.read();
    });
  }

  public async close(): Promise<void> {
    await this.fd?.close();
    this.fd = undefined;
  }

  private async read(): Promise<void> {
    if (!this.fd) {
      return;
    }
    const buffer = Buffer.alloc(24);
    try {
      const packet = await this.fd.read(buffer, 0, buffer.length);
      this.decodeAndEmitPacket(packet);
      this.read();
    } catch (err) {
      console.error(err);
    }
  }

  private decodeAndEmitPacket(packet: fs.promises.FileReadResult<Buffer>): void {
    let event: InputEvent;
    if (process.arch === "x64") {
      event = {
        timeS: readUInt64LE(packet.buffer, 0),
        timeMS: readUInt64LE(packet.buffer, 8),
        type: packet.buffer.readUInt16LE(16),
        code: packet.buffer.readUInt16LE(18),
        value: packet.buffer.readInt32LE(20),
      };
    } else {
      // arm or ia32
      event = {
        timeS: packet.buffer.readUInt32LE(0),
        timeMS: packet.buffer.readUInt32LE(4),
        type: packet.buffer.readUInt16LE(8),
        code: packet.buffer.readUInt16LE(10),
        value: packet.buffer.readInt32LE(12),
      };
    }
    this.emit("input", event);
  }
}
