import events from "events";
import fs from "fs";
import { writeIoctl32 } from "../../helpers/ioctlHelpers";
import { LircEvent, LircIoCtlCommand, LircMode, SCAN_CODE_SIZE } from "./lirc";
import debug from "debug";

const log = debug('unisonht:lirc:LircEventWriter');

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface LircEventReader {
  on(event: "input", listener: (event: LircEvent) => void): this;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class LircEventReader extends events.EventEmitter {
  private fd?: fs.promises.FileHandle;

  public async open(path: string): Promise<void> {
    if (this.fd) {
      throw new Error("lirc device already open");
    }
    log(`opening lirc ${path} for read`);
    this.fd = await fs.promises.open(path, "r");
    await writeIoctl32(this.fd, LircIoCtlCommand.SetReceiveMode, LircMode.ScanCode);
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
      try {
        this.emit("input", event);
      } catch (err) {
        console.error(err);
      }
    }
  }
}
