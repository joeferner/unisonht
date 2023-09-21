import debug from "debug";
import { EventType, UnisonHT, UnisonHTEvent } from "./UnisonHT";
import { GetHtmlParams, UnisonHTModule } from "./UnisonHTModule";
import { Key } from "./keys";
import {
  DenonRemote,
  LircRemote,
  LircRxModule,
  LircTxModule,
  PioneerRemote,
  RcaRemote,
  enableAllProtocols,
  findRcDeviceLircDevDir,
  getRcDevices,
} from "./modules/ir";
import { ModeModule } from "./modules/mode";

const log = debug("unisonht:home");

const MODE_OFF = "off";
const MODE_ON = "on";

const REMOTE_TV = "tv";
const REMOTE_AV = "av";
const REMOTE_HOME = "home";

async function run(): Promise<void> {
  const port = process.env.PORT || 8080;

  const remotes: LircRemote[] = [
    new PioneerRemote(REMOTE_TV, "TV"),
    new DenonRemote(REMOTE_AV, "Receiver"),
    new RcaRemote(REMOTE_HOME, "Roku Remote"),
  ];
  const [lircRxDevice, lircTxDevice] = await findRemotes();

  const unisonht = new UnisonHT();
  unisonht.use(new HomeModule());
  unisonht.use(new ModeModule({ currentMode: MODE_OFF, modes: [MODE_OFF, MODE_ON] }));
  unisonht.use(new LircRxModule(lircRxDevice, { remotes }));
  unisonht.use(new LircTxModule(lircTxDevice, { remotes }));
  unisonht.start({ port }).then(() => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

async function findRemotes(): Promise<[string, string]> {
  if (process.env.MOCK_IR) {
    return ["/tmp/mock-ir-rx", "/tmp/mock-ir-tx"];
  }

  const rcDevices = await getRcDevices();
  const lircRxDevice = findRcDeviceLircDevDir(rcDevices, "gpio_ir_recv", 0);
  if (!lircRxDevice) {
    throw new Error("could not find lirc rx device");
  }
  await enableAllProtocols(rcDevices, "gpio_ir_recv");

  const lircTxDevice = findRcDeviceLircDevDir(rcDevices, "gpio-ir-tx", 0);
  if (!lircTxDevice) {
    throw new Error("could not find lirc tx device");
  }

  return [lircRxDevice, lircTxDevice];
}

class HomeModule implements UnisonHTModule {
  private modeModule?: ModeModule;

  public get name(): string {
    return "home";
  }

  public get displayName(): string {
    return "Home";
  }

  public async init(unisonht: UnisonHT): Promise<void> {
    const modeModule = unisonht.getModule(ModeModule.DEFAULT_NAME);
    if (!modeModule) {
      throw new Error(`failed to find module ${ModeModule.DEFAULT_NAME}`);
    }
    if (!(modeModule instanceof ModeModule)) {
      throw new Error(`invalid module ${modeModule.name}`);
    }
    modeModule.on("modeSwitch", (event) => {
      if (event.newMode === MODE_OFF) {
        return this.switchModeToOff(unisonht);
      } else if (event.newMode === MODE_ON) {
        return this.switchModeToOn(unisonht);
      } else {
        throw new Error(`unhandled mode ${event.newMode}`);
      }
    });
    this.modeModule = modeModule;
  }

  private async switchModeToOff(unisonht: UnisonHT): Promise<void> {
    await unisonht.sendButton(REMOTE_TV, Key.POWER_OFF);
    await unisonht.sendButton(REMOTE_AV, Key.POWER_OFF);
  }

  private async switchModeToOn(unisonht: UnisonHT): Promise<void> {
    await unisonht.sendButton(REMOTE_TV, Key.POWER_ON);
    await unisonht.sendButton(REMOTE_AV, Key.POWER_ON);
  }

  public async handle(unisonht: UnisonHT, event: UnisonHTEvent): Promise<boolean> {
    if (event.type === EventType.Key && event.remoteName === REMOTE_HOME) {
      switch (event.key) {
        case Key.POWER_TOGGLE:
          await this.handleTogglePower();
          break;
        case Key.VOLUME_UP:
        case Key.VOLUME_DOWN:
        case Key.MUTE:
          await unisonht.sendButton(REMOTE_AV, event.key);
          break;
        default:
          log(`unhandled key ${event.key}`);
          break;
      }
      return true;
    }
    return false;
  }

  private async handleTogglePower(): Promise<void> {
    if (!this.modeModule) {
      throw new Error("modeModule not initialize");
    }
    const newMode = this.modeModule.currentMode === MODE_ON ? MODE_OFF : MODE_ON;
    await this.modeModule.switchModes(newMode);
  }

  public async getHtml(_unisonht: UnisonHT, _params: GetHtmlParams): Promise<string> {
    return "Home Module";
  }
}

run().catch((err) => console.error(err));
