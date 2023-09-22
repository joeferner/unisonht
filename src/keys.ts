export enum Key {
  NUM_0 = "NUM_0",
  NUM_1 = "NUM_1",
  NUM_2 = "NUM_2",
  NUM_3 = "NUM_3",
  NUM_4 = "NUM_4",
  NUM_5 = "NUM_5",
  NUM_6 = "NUM_6",
  NUM_7 = "NUM_7",
  NUM_8 = "NUM_8",
  NUM_9 = "NUM_9",

  INPUT_1 = "INPUT_1",
  INPUT_2 = "INPUT_2",
  INPUT_3 = "INPUT_3",
  INPUT_4 = "INPUT_4",
  INPUT_5 = "INPUT_5",
  INPUT_6 = "INPUT_6",
  INPUT_PC = "INPUT_PC",
  INPUT_ANT = "INPUT_ANT",

  POWER_TOGGLE = "POWER_TOGGLE",
  POWER_ON = "POWER_ON",
  POWER_OFF = "POWER_OFF",

  DIR_UP = "DIR_UP",
  DIR_RIGHT = "DIR_RIGHT",
  DIR_DOWN = "DIR_DOWN",
  DIR_LEFT = "DIR_LEFT",

  CHANNEL_UP = "CHANNEL_UP",
  CHANNEL_DOWN = "CHANNEL_DOWN",
  VOLUME_UP = "VOLUME_UP",
  VOLUME_DOWN = "VOLUME_DOWN",
  MUTE = "MUTE",

  RECORD = "RECORD",
  SELECT = "SELECT",
  GUIDE = "GUIDE",
  HOME = "HOME",
  MENU = "MENU",
  BACK = "BACK",
  INFO = "INFO",
  SIZE = "SIZE",
  SLEEP = "SLEEP",
  DISPLAY = "DISPLAY",
  AV_SELECTION = "AV_SELECTION",

  PAGE_UP = "PAGE_UP",
  PAGE_DOWN = "PAGE_DOWN",

  DAY_PLUS = "DAY_PLUS",
  DAY_MINUS = "DAY_MINUS",
  FAVORITE_A = "FAVORITE_A",
  FAVORITE_B = "FAVORITE_B",
  FAVORITE_C = "FAVORITE_C",
  FAVORITE_D = "FAVORITE_D",
  DOT = "DOT",
  CHANNEL_ENTER = "CHANNEL_ENTER",
  CHANNEL_RETURN = "CHANNEL_RETURN",
  DIMMER = "DIMMER",

  INPUT_CD = "INPUT_CD",
  INPUT_DBS = "INPUT_DBS",
  INPUT_DVD = "INPUT_DVD",
  INPUT_MODE = "INPUT_MODE",
  INPUT_MODE_ANALOG = "INPUT_MODE_ANALOG",
  INPUT_MODE_EXT_IN = "INPUT_MODE_EXT_IN",
  INPUT_PHONO = "INPUT_PHONO",
  INPUT_TAPE = "INPUT_TAPE",
  INPUT_TUNER = "INPUT_TUNER",
  INPUT_TV = "INPUT_TV",
  INPUT_V_AUX = "INPUT_V_AUX",
  INPUT_VCR1 = "INPUT_VCR1",
  INPUT_VCR2 = "INPUT_VCR2",
  INPUT_VDP = "INPUT_VDP",
  MODE_5CH_7CH = "MODE_5CH_7CH",
  MODE_CINEMA = "MODE_CINEMA",
  MODE_DSP_SIMU = "MODE_DSP_SIMU",
  MODE_GAME = "MODE_GAME",
  MODE_MUSIC = "MODE_MUSIC",
  MODE_PURE_DIRECT = "MODE_PURE_DIRECT",
  MODE_STANDARD = "MODE_STANDARD",
  MODE_STEREO = "MODE_STEREO",
  MODE_SURROUND_BACK = "MODE_SURROUND_BACK",
  ON_SCREEN = "ON_SCREEN",
  POWER_OFF_MAIN = "POWER_OFF_MAIN",
  POWER_ON_MAIN = "POWER_ON_MAIN",
  PRESET_NEXT = "PRESET_NEXT",
  PRESET_PREVIOUS = "PRESET_PREVIOUS",
  ROOM_EQ = "ROOM_EQ",
  SPEAKER = "SPEAKER",
  SURROUND_PARAMETER = "SURROUND_PARAMETER",
  SYSTEM_SETUP = "SYSTEM_SETUP",
  TEST_TONE = "TEST_TONE",
  TUNER_BAND = "TUNER_BAND",
  TUNER_MEMORY = "TUNER_MEMORY",
  TUNER_MODE = "TUNER_MODE",
  TUNER_SHIFT = "TUNER_SHIFT",
  VIDEO_OFF = "VIDEO_OFF",
  VIDEO_SELECT = "VIDEO_SELECT",
}

export function keyToShortDisplayName(key: Key | string): string {
  switch (key) {
    case Key.NUM_0:
      return "0";
    case Key.NUM_1:
      return "1";
    case Key.NUM_2:
      return "2";
    case Key.NUM_3:
      return "3";
    case Key.NUM_4:
      return "4";
    case Key.NUM_5:
      return "5";
    case Key.NUM_6:
      return "6";
    case Key.NUM_7:
      return "7";
    case Key.NUM_8:
      return "8";
    case Key.NUM_9:
      return "9";
    case Key.VOLUME_UP:
      return "VOL UP";
    case Key.VOLUME_DOWN:
      return "VOL DOWN";
    case Key.CHANNEL_UP:
      return "CH UP";
    case Key.CHANNEL_DOWN:
      return "CH DOWN";
    case Key.POWER_OFF:
      return "PWR OFF";
    case Key.POWER_ON:
      return "PWR ON";
    case Key.POWER_TOGGLE:
      return "PWR TGL";
  }
  return key.replace("_", " ");
}
