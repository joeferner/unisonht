import debug from "debug";
import fs from "fs";
import { writeIoctl32 } from "../../helpers/ioctlHelpers";
import { LircIoCtlCommand, LircMode, LircProto, SCAN_CODE_SIZE } from "./lirc";

const log = debug('unisonht:lirc:LircEventWriter');

export class LircEventWriter {
  private fd?: fs.promises.FileHandle;

  public async open(path: string): Promise<void> {
    if (this.fd) {
      throw new Error("lirc device already open");
    }
    log(`opening lirc ${path} for write`);
    this.fd = await fs.promises.open(path, "w");
    await writeIoctl32(this.fd, LircIoCtlCommand.SetSendMode, LircMode.ScanCode);
  }

  public async close(): Promise<void> {
    await this.fd?.close();
    this.fd = undefined;
  }

  public async send(proto: LircProto, scanCode: number | bigint): Promise<void> {
    if (!this.fd) {
      throw new Error("lirc device not open");
    }
    const buffer = Buffer.alloc(SCAN_CODE_SIZE);
    buffer.writeBigUInt64LE(BigInt(0), 0);
    buffer.writeUInt16LE(0, 8);
    buffer.writeUInt16LE(proto, 10);
    buffer.writeUInt32LE(0, 12);
    buffer.writeBigUInt64LE(BigInt(scanCode), 16);
    this.fd.write(buffer);
  }
}
