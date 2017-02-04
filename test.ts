import * as express from "express";
import {UnisonHT, TemporaryGlobalMode, Device, GlobalMode, Mode} from "./index";
import {UnisonHTResponse} from "./lib/UnisonHT";

class TestDevice extends Device {
  constructor(deviceName: string) {
    super(deviceName);
  }

  getStatus(): Promise<Device.Status> {
    return Promise.resolve({});
  }

  protected handleButtonPress(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    const buttonName = req.query.button;
    console.log(`${this.getDeviceName()}: button press: ${buttonName}`);
    res.promiseNoContent(Promise.resolve());
  }
}

let unisonht = new UnisonHT();

unisonht.use(new TemporaryGlobalMode({
  activateButton: 'TEMP',
  nextOnNotFound: false,
  buttonMap: {
    VOLUMEUP: (req, res) => {
      res.deviceButtonPress('tempDevice', 'VOLUMEUP');
    },
    VOLUMEDOWN: (req, res) => {
      res.deviceButtonPress('tempDevice', 'VOLUMEDOWN');
    }
  }
}));

unisonht.use(new GlobalMode({
  buttonMap: {
    ON: (req, res) => {
      res.changeMode('default');
    },
    VOLUMEUP: (req, res) => {
      res.deviceButtonPress('receiver', 'VOLUMEUP');
    },
    VOLUMEDOWN: (req, res) => {
      res.deviceButtonPress('receiver', 'VOLUMEDOWN');
    }
  }
}));

unisonht.use(new Mode('default', {
  buttonMap: {
    NUM1: (req, res) => {
      res.changeMode('tv');
    }
  }
}));

unisonht.use(new Mode('tv', {
  buttonMap: {
    MENU: (req, res) => {
      console.log('tv menu');
      res.promiseNoContent(Promise.resolve());
    },
    EXIT: (req, res) => {
      res.changeMode('default');
    }
  },
  defaultDevice: 'tv'
}));


unisonht.use(new TestDevice('tempDevice'));
unisonht.use(new TestDevice('receiver'));
unisonht.use(new TestDevice('tv'));

unisonht.listen(3000);
