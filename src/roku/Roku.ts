import { Device, DeviceInitOptions, DeviceStatus, UnisonHT, UnisonHTRequest } from '../unisonht';
import * as path from 'path';
import { StaticFile } from '../unisonht/StaticFile';
import { StandardButton } from '../unisonht/StandardButton';
import Client, { keys } from 'roku-client';

export class Roku implements Device {
  private _name: string;
  private _publicPath: string;
  private _address: any;
  private _client: Client;
  private static BUTTON_MAP: ButtonMap = {
    [StandardButton.HOME]: { title: 'Home', rokuKey: keys.HOME },
    [StandardButton.REWIND]: { title: 'Reverse', rokuKey: keys.REVERSE },
    [StandardButton.FAST_FORWARD]: { title: 'Forward', rokuKey: keys.FORWARD },
    [StandardButton.PLAY_PAUSE]: { title: 'Play', rokuKey: keys.PLAY },
    [StandardButton.OK]: { title: 'OK', rokuKey: keys.SELECT },
    [StandardButton.LEFT]: { title: 'Left', rokuKey: keys.LEFT },
    [StandardButton.RIGHT]: { title: 'Right', rokuKey: keys.RIGHT },
    [StandardButton.UP]: { title: 'Up', rokuKey: keys.UP },
    [StandardButton.DOWN]: { title: 'Down', rokuKey: keys.DOWN },
    [StandardButton.BACK]: { title: 'Back', rokuKey: keys.BACK },
    [StandardButton.INFO]: { title: 'Info', rokuKey: keys.INFO },
    [StandardButton.ENTER]: { title: 'Enter', rokuKey: keys.ENTER },
    [StandardButton.VOLUME_UP]: { title: 'Volume Up', rokuKey: keys.VOLUME_UP },
    [StandardButton.VOLUME_DOWN]: { title: 'Volume Down', rokuKey: keys.VOLUME_DOWN },
    [StandardButton.MUTE]: { title: 'Mute', rokuKey: keys.VOLUME_MUTE },
    [StandardButton.CHANNEL_UP]: { title: 'Channel Up', rokuKey: keys.CHANNEL_UP },
    [StandardButton.CHANNEL_DOWN]: { title: 'Channel Down', rokuKey: keys.CHANNEL_DOWN },
    [StandardButton.POWER_TOGGLE]: { title: 'Power Toggle', rokuKey: keys.POWER },
    [StandardButton.REPLAY]: { title: 'Instant Replay', rokuKey: keys.INSTANT_REPLAY },
    [StandardButton.BACKSPACE]: { title: 'Backspace', rokuKey: keys.BACKSPACE },
    [StandardButton.SEARCH]: { title: 'Search', rokuKey: keys.SEARCH },
    [StandardButton.FIND_REMOTE]: { title: 'Find Remote', rokuKey: keys.FIND_REMOTE },
    [StandardButton.INPUT_TUNER]: { title: 'Input: Tuner', rokuKey: keys.INPUT_TUNER },
    [StandardButton.INPUT_HDMI1]: { title: 'Input: HDMI1', rokuKey: keys.INPUT_HDMI1 },
    [StandardButton.INPUT_HDMI2]: { title: 'Input: HDMI2', rokuKey: keys.INPUT_HDMI2 },
    [StandardButton.INPUT_HDMI3]: { title: 'Input: HDMI3', rokuKey: keys.INPUT_HDMI3 },
    [StandardButton.INPUT_HDMI4]: { title: 'Input: HDMI4', rokuKey: keys.INPUT_HDMI4 },
    [StandardButton.INPUT_AV1]: { title: 'Input: AV1', rokuKey: keys.INPUT_AV1 },
  };

  constructor(options: RokuOptions) {
    this._name = options.name;
    this._address = options.address;
    this._client = new Client(options.address);
    this._publicPath = path.join(__dirname, '../../src/roku/public/');
  }

  get name() {
    return this._name;
  }

  async init(app: DeviceInitOptions): Promise<void> {
    app.onGet('/roku/discover', async (req) => this.handleDiscover(req));
    app.onGet('roku-remote.svg', async () => new StaticFile(path.join(this._publicPath, 'roku-remote.svg')));
  }

  private async handleDiscover(req: UnisonHTRequest) {
    const timeout = parseInt(req.parameters['timeout'] || '5000');
    return Roku.discoverAll(timeout);
  }

  async publicModulePath(app: UnisonHT): Promise<string> {
    return path.join(this._publicPath, 'Roku.jsx');
  }

  async getStatus(req: UnisonHTRequest): Promise<DeviceStatus> {
    const [info, active, apps] = await Promise.all([
      this._client.info(),
      this._client.active(),
      this._client.apps(),
    ]);
    return Roku.normalizeStatus({
      address: this._address,
      ...info,
      activeApp: active,
      apps,
    });
  }

  async buttonPress(app: UnisonHT, buttonName: string): Promise<boolean> {
    const button = Roku.BUTTON_MAP[buttonName];
    if (!button) {
      return false;
    }
    return this._client.keypress(button.rokuKey)
      .then(() => {
        return true;
      });
  }

  public static async discoverAll(timeout?: number): Promise<RokuStatus[]> {
    const clients = await Client.discoverAll(timeout);
    const clientAndClientInfos = await Promise.all(
      clients.map(client => {
        return new Promise<ClientAndClientInfo>((resolve, reject) => {
          client
            .info()
            .then(clientInfo => {
              return resolve({ client, clientInfo });
            })
            .catch(err => {
              return reject(err);
            });
        });
      }),
    );
    return clientAndClientInfos.map(data => {
      const { client, clientInfo } = data;
      const obj: any = {
        address: client.ip,
        ...clientInfo,
      };
      return Roku.normalizeStatus(obj);
    });
  }

  private static normalizeStatus(obj: any): RokuStatus {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value === 'true') {
        obj[key] = true;
      } else if (value === 'false') {
        obj[key] = false;
      } else if (key === 'uptime') {
        obj[key] = parseInt(value, 10);
      }
    });
    return obj;
  }
}

export interface RokuOptions {
  address: string,
  name: string
}

interface ButtonMap {
  [key: string]: ButtonMapItem;
}

interface ButtonMapItem {
  title: string;
  rokuKey: {
    command: string;
    name: string;
  };
}

interface ClientAndClientInfo {
  client: Client;
  clientInfo: Record<string, string>;
}

export interface RokuStatus extends DeviceStatus {
  address: string;
  udn?: string;
  serialNumber?: string;
  deviceId?: string;
  advertisingId?: string;
  vendorName?: string;
  modelName?: string;
  modelNumber?: string;
  modelRegion?: string;
  isTv?: boolean;
  isStick?: boolean;
  supportsEthernet?: boolean;
  wifiMac?: string;
  wifiDriver?: string;
  ethernetMac?: string;
  networkType?: string;
  friendlyDeviceName?: string;
  friendlyModelName?: string;
  defaultDeviceName?: string;
  userDeviceName?: string;
  buildNumber?: string;
  softwareVersion?: string;
  softwareBuild?: string;
  secureDevice?: boolean;
  language?: string;
  country?: string;
  locale?: string;
  timeZoneAuto?: boolean;
  timeZone?: string;
  timeZoneName?: string;
  timeZoneTz?: string;
  timeZoneOffset?: string;
  clockFormat?: string;
  uptime?: number;
  powerMode?: string;
  supportsSuspend?: boolean;
  supportsFindRemote?: boolean;
  findRemoteIsPossible?: boolean;
  supportsAudioGuide?: boolean;
  supportsRva?: boolean;
  developerEnabled?: boolean;
  keyedDeveloperId?: string;
  searchEnabled?: boolean;
  searchChannelsEnabled?: boolean;
  voiceSearchEnabled?: boolean;
  notificationsEnabled?: boolean;
  notificationsFirstUse?: boolean;
  supportsPrivateListening?: boolean;
  headphonesConnected?: boolean;
  supportsEcsTextedit?: boolean;
  supportsEcsMicrophone?: boolean;
  supportsWakeOnWlan?: boolean;
  hasPlayOnRoku?: boolean;
  hasMobileScreensaver?: boolean;
  supportUrl?: string;
  grandcentralVersion?: string;
  davinciVersion?: string;
}
