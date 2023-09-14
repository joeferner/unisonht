import debug from "debug";
import fs from "fs";
import path from "path";

const log = debug("unisonht:RcDevices");

export interface RcDeviceInputEvent {
  eventDir: string;
  devName?: string;
}

export interface RcDeviceInput {
  inputDir: string;
  events: RcDeviceInputEvent[];
}

export interface RcDeviceLirc {
  lircDir: string;
  devName?: string;
}

export interface RcDevice {
  rcPath: string;
  driver?: string;
  inputs: RcDeviceInput[];
  lircs: RcDeviceLirc[];
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
      const [deviceUEvent, inputs, lircs] = await Promise.all([
        parseDeviceUEvent(deviceDir),
        parseInputs(deviceDir),
        parseLircs(deviceDir),
      ]);
      return {
        ...deviceUEvent,
        inputs,
        lircs,
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

async function parseLircs(deviceDir: string): Promise<RcDeviceLirc[]> {
  const dirs = await fs.promises.readdir(deviceDir);
  const lircs = await Promise.all(
    dirs.map(async (d) => {
      if (d.startsWith("lirc")) {
        return await parseLirc(path.join(deviceDir, d));
      } else {
        return undefined;
      }
    }),
  );
  return lircs.filter((d): d is RcDeviceLirc => !!d);
}

async function parseLirc(lircDir: string): Promise<RcDeviceLirc> {
  const uevent = await fs.promises.readFile(path.join(lircDir, "uevent"), "utf8");
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
    lircDir,
    devName,
  };
}

export function findRcDeviceLircDevDir(devices: RcDevice[], driver: string, lircIndex: number): string | undefined {
  return devices.flatMap((d) => {
    if (d.driver === driver) {
      const lirc = d.lircs[lircIndex];
      const devName = lirc?.devName;
      if (devName) {
        return path.join("/dev", devName);
      }
    }
    return [];
  })[0];
}

export async function enableAllProtocols(devices: RcDevice[], driver: string): Promise<void> {
  for (const device of devices) {
    if (device.driver === driver) {
      await enableAllProtocolsOnDevice(device);
    }
  }
}

export async function enableAllProtocolsOnDevice(device: RcDevice): Promise<void> {
  const protocolsFile = path.join(device.rcPath, "protocols");
  const protocols = (await fs.promises.readFile(protocolsFile, "utf8")).split(" ");
  for (const protocol of protocols) {
    if (!protocol.startsWith("[")) {
      log(`enabling protocol ${protocol}`);
      await fs.promises.writeFile(protocolsFile, `+${protocol}`);
    }
  }
  log(`protocols ${await fs.promises.readFile(protocolsFile, "utf8")}`);
}
