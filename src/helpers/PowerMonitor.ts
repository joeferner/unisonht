import { Mutex, MutexInterface, withTimeout } from "async-mutex";
import { Mcp3204 } from "./Mcp3204";
export interface PowerMonitorOptions {
  updateInterval: number;
  channels: number[];
}

export class PowerMonitor {
  private readonly mcp3204: Mcp3204;
  private readonly mutex: MutexInterface;
  private readonly updateInterval: number;
  private readonly channels: Channel[];
  private timeout?: NodeJS.Timeout;

  public constructor(options: PowerMonitorOptions) {
    this.mcp3204 = new Mcp3204();
    this.mutex = withTimeout(new Mutex(), 10000);
    this.updateInterval = options.updateInterval;
    this.channels = options.channels.map((ch) => ({
      ch,
      offsetI: Mcp3204.MAX_VALUE / 2,
      power: 0,
    }));
  }

  public async open(): Promise<void> {
    await this.mcp3204.open();
    this.update();
  }

  private async update(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    if (this.updateInterval === 0) {
      return;
    }
    for (const channel of this.channels) {
      try {
        this.readChannel(channel);
      } catch (err) {
        console.error("failed to read power", err);
      }
    }
    this.timeout = setTimeout(() => this.update(), this.updateInterval);
  }

  private async readChannel(channel: Channel): Promise<number> {
    return this.mutex.runExclusive(async () => {
      let sumSquares = 0;
      const numberOfSamples = 1000;
      for (let i = 0; i < numberOfSamples; i++) {
        const sampleI = await this.mcp3204.readSingle(channel.ch);
        channel.offsetI = channel.offsetI + (sampleI - channel.offsetI) / Mcp3204.MAX_VALUE;
        const filteredI = sampleI - channel.offsetI;
        sumSquares += filteredI * filteredI;
      }
      const current = Math.sqrt(sumSquares / numberOfSamples) / 252;
      const power = current * 120;
      channel.power = power;
      return power;
    });
  }

  public async read(channel: number): Promise<number> {
    const ch = this.channels.filter((c) => c.ch === channel)[0];
    if (!ch) {
      throw new Error(`invalid channel ${channel}, must be one of ${this.channels.map((c) => c.ch)}`);
    }
    return this.readChannel(ch);
  }

  public getPower(channel: number): number {
    const ch = this.channels.filter((c) => c.ch === channel)[0];
    if (!ch) {
      throw new Error(`invalid channel ${channel}, must be one of ${this.channels.map((c) => c.ch)}`);
    }
    return ch.power;
  }
}

interface Channel {
  ch: number;
  offsetI: number;
  power: number;
}
