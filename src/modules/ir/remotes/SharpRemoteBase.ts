import { LircEventWriter } from "../LircEventWriter";
import { LircProto } from "../lirc";
import { GenericRemoteBase, GenericRemoteBaseOptions } from "./GenericRemoteBase";

const ADDRESS_BIT_COUNT = 5;
const ADDRESS_MASK = Math.pow(2, ADDRESS_BIT_COUNT) - 1;
const COMMAND_BIT_COUNT = 8;
const COMMAND_MASK = Math.pow(2, COMMAND_BIT_COUNT) - 1;
const EXP_BIT_COUNT = 1;
const CHK_BIT_COUNT = 1;
const PULSES_PER_BIT = 2;
const SHARP_UNIT = 40;

export class SharpRemoteBase extends GenericRemoteBase {
  public constructor(name: string, options: GenericRemoteBaseOptions) {
    super(name, options);
  }

  protected override async sendToLircEventWriter(
    tx: LircEventWriter,
    _protocol: LircProto,
    scanCode: bigint,
  ): Promise<void> {
    const address = Number((scanCode >> BigInt(COMMAND_BIT_COUNT)) & BigInt(ADDRESS_MASK));
    const command = Number(scanCode & BigInt(COMMAND_MASK));
    const raw = Buffer.alloc(
      (ADDRESS_BIT_COUNT + COMMAND_BIT_COUNT + EXP_BIT_COUNT + CHK_BIT_COUNT) * PULSES_PER_BIT * 2 + 3,
    );
    let rawIndex = 0;

    const addBits = (value: number, count: number): void => {
      for (let i = 0; i < count; i++) {
        raw[rawIndex++] = SHARP_UNIT * 8; // 320us
        if (value & (1 << i)) {
          raw[rawIndex++] = SHARP_UNIT * 42; // logical "1" - 2ms - 320us = 1680us
        } else {
          raw[rawIndex++] = SHARP_UNIT * 17; // logical "0" - 1ms - 320us = 680us
        }
      }
    };

    addBits(address, ADDRESS_BIT_COUNT);
    addBits(command, COMMAND_BIT_COUNT);
    addBits(1, 2);
    raw[rawIndex++] = SHARP_UNIT * 8; // 320us - trailing pulse
    raw[rawIndex++] = SHARP_UNIT * 1000; // 40ms - space
    addBits(address, ADDRESS_BIT_COUNT);
    addBits(~command, COMMAND_BIT_COUNT);
    addBits(~1, 2);
    raw[rawIndex++] = SHARP_UNIT * 8; // 320us - trailing pulse

    return await tx.sendRaw(raw);
  }
}
