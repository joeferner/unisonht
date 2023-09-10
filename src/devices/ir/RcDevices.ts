import fs from "fs";
import path from "path";

export interface RcDeviceInputEvent {
  eventDir: string;
  devName?: string;
}

export interface RcDeviceInput {
  inputDir: string;
  events: RcDeviceInputEvent[];
}

export interface RcDevice {
  rcPath: string;
  driver?: string;
  inputs: RcDeviceInput[];
}

interface DeviceUEvent {
  driver?: string;
}

export async function getRcDevices(): Promise<RcDevice[]> {
  const rcBaseDir = "/sys/class/rc";
  const rcDir = await fs.promises.readdir(rcBaseDir);
  return Promise.all(
    rcDir.map(async (rc) => {
      const deviceDir = path.join(rcBaseDir, rc);
      const deviceUEvent = await parseDeviceUEvent(deviceDir);
      const inputs = await parseInputs(deviceDir);
      return {
        ...deviceUEvent,
        inputs,
        rcPath: deviceDir,
      };
    }),
  );
}

async function parseDeviceUEvent(deviceDir: string): Promise<DeviceUEvent> {
  const uevent = await fs.promises.readFile(path.join(deviceDir, "device/uevent"), "utf8");
  const ueventLines = uevent.split("\n");
  let driver: string | undefined;
  for (const ueventLine of ueventLines) {
    const parts = ueventLine.split("=", 2);
    if (parts.length === 2) {
      if (parts[0].trim() === "DRIVER") {
        driver = parts[1].trim();
      }
    }
  }
  return { driver };
}

async function parseInputs(deviceDir: string): Promise<RcDeviceInput[]> {
  const dirs = await fs.promises.readdir(deviceDir);
  const inputs = await Promise.all(
    dirs.map(async (d) => {
      if (d.startsWith("input")) {
        return await parseInput(path.join(deviceDir, d));
      } else {
        return undefined;
      }
    }),
  );
  return inputs.filter((d): d is RcDeviceInput => !!d);
}

async function parseInput(inputDir: string): Promise<RcDeviceInput> {
  return {
    inputDir,
    events: await parseInputEvents(inputDir),
  };
}

async function parseInputEvents(inputDir: string): Promise<RcDeviceInputEvent[]> {
  const dirs = await fs.promises.readdir(inputDir);
  const inputs = await Promise.all(
    dirs.map(async (d) => {
      if (d.startsWith("event")) {
        return await parseInputEvent(path.join(inputDir, d));
      } else {
        return undefined;
      }
    }),
  );
  return inputs.filter((d): d is RcDeviceInputEvent => !!d);
}

async function parseInputEvent(eventDir: string): Promise<RcDeviceInputEvent> {
  const uevent = await fs.promises.readFile(path.join(eventDir, "uevent"), "utf8");
  const ueventLines = uevent.split("\n");
  let devName: string | undefined;
  for (const ueventLine of ueventLines) {
    const parts = ueventLine.split("=", 2);
    if (parts.length === 2) {
      if (parts[0].trim() === "DEVNAME") {
        devName = parts[1].trim();
      }
    }
  }
  return {
    eventDir,
    devName,
  };
}

export function findRcDeviceInputEventPath(
  devices: RcDevice[],
  driver: string,
  inputIndex: number,
  eventIndex: number,
): string | undefined {
  return devices.flatMap((d) => {
    if (d.driver === driver) {
      const input = d.inputs[inputIndex];
      const event = input?.events?.[eventIndex];
      const devName = event?.devName;
      if (devName) {
        return path.join("/dev", devName);
      }
    }
    return [];
  })[0];
}
