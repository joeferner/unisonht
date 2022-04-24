import { UnisonHTServer } from "..";
import { IrTxRxConfig } from "../types/Config";
import { IrTxRx, IrTxRxFactory } from "../types/IrTxRx";

export class MockIrTxRxFactory implements IrTxRxFactory {
  get id(): string {
    return "unisonht:mock-ir-tx-rx";
  }

  async createIrTxRx(
    server: UnisonHTServer,
    config: IrTxRxConfig
  ): Promise<IrTxRx> {
    return new MockIrTxRx();
  }
}

export class MockIrTxRx extends IrTxRx {}
