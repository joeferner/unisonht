import { _IOR, _IOW } from "../../helpers/ioctlHelpers";

export const SCAN_CODE_SIZE = (64 + 16 + 16 + 32 + 64) / 8;

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
  SetSendMode = _IOW("i", 0x00000011, 4),
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
