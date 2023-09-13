import fs from "fs";
import ioctl from "ioctl";
import { newNestedError } from "./NestedError";

// see https://github.com/torvalds/linux/blob/master/include/uapi/asm-generic/ioctl.h

const _IOC_NRBITS = 8;
const _IOC_TYPEBITS = 8;
const _IOC_SIZEBITS = 14;
const _IOC_DIRBITS = 2;

const _IOC_NRMASK = (1 << _IOC_NRBITS) - 1;
const _IOC_TYPEMASK = (1 << _IOC_TYPEBITS) - 1;
const _IOC_SIZEMASK = (1 << _IOC_SIZEBITS) - 1;
const _IOC_DIRMASK = (1 << _IOC_DIRBITS) - 1;

const _IOC_NRSHIFT = 0;
const _IOC_TYPESHIFT = _IOC_NRSHIFT + _IOC_NRBITS;
const _IOC_SIZESHIFT = _IOC_TYPESHIFT + _IOC_TYPEBITS;
const _IOC_DIRSHIFT = _IOC_SIZESHIFT + _IOC_SIZEBITS;

/*
 * Direction bits, which any architecture can choose to override
 * before including this file.
 *
 * NOTE: _IOC_WRITE means userland is writing and kernel is
 * reading. _IOC_READ means userland is reading and kernel is writing.
 */
const _IOC_NONE = 0;
const _IOC_WRITE = 1;
const _IOC_READ = 2;

export function _IOC(dir: number, type: string, nr: number, size: number): number {
  return (
    ((dir << _IOC_DIRSHIFT) |
      (type.charCodeAt(0) << _IOC_TYPESHIFT) |
      (nr << _IOC_NRSHIFT) |
      (size << _IOC_SIZESHIFT)) >>>
    0
  );
}

export function _IOR(type: string, nr: number, size: number): number {
  return _IOC(_IOC_READ, type, nr, size);
}

export function _IOW(type: string, nr: number, size: number): number {
  return _IOC(_IOC_WRITE, type, nr, size);
}

export async function readIoctl32(fd: fs.promises.FileHandle, cmd: number): Promise<number> {
  const v = Buffer.alloc(4);
  try {
    if (ioctl(fd.fd, cmd, v) !== 0) {
      throw new Error("failed to set receive mode");
    }
  } catch (err) {
    throw newNestedError(`failed to ioctl (cmd: 0x${cmd.toString(16)})`, err);
  }
  return v.readUInt32LE(0);
}

export async function writeIoctl32(fd: fs.promises.FileHandle, cmd: number, value: number): Promise<void> {
  const v = Buffer.alloc(4);
  v.writeUInt32LE(value, 0);
  try {
    if (ioctl(fd.fd, cmd, v) !== 0) {
      throw new Error("failed to set receive mode");
    }
  } catch (err) {
    throw newNestedError(`failed to ioctl (cmd: 0x${cmd.toString(16)}, value: 0x${value.toString(16)})`, err);
  }
}
