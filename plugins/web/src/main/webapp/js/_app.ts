/// <reference path="./ext/definitelyTyped/jquery/jquery.d.ts" />
/// <reference path="./ext/definitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./ext/definitelyTyped/bootstrap/bootstrap.d.ts" />
/// <reference path="./ext/definitelyTyped/es6-promise/es6-promise.d.ts" />
/// <reference path="./controllers/main.ts" />
/// <reference path="./controllers/remotes.ts" />
/// <reference path="./services/config.ts" />
/// <reference path="./services/remote.ts" />

module unisonht {
  export interface IAlert {
    severity: string;
    message: string;
  }

  export interface IConfig {
    devices: { [name: string]: IConfigDevice; };
    macros: { [name:string]: IConfigAction; };
    modes: { [name:string]: IConfigMode; };
    remotes: { [name:string]: IConfigRemote; };
  }

  export interface IConfigDevice {
    deviceClass: string;
    data: any;
  }

  export interface IConfigMode {
    onEnter: IConfigAction;
    buttonMap: { [name:string]: IConfigAction; };
  }

  export interface IConfigAction {
    action: string;
  }

  export interface IConfigRemote {
    buttonMap: { [name:string]: IConfigRemoteButton; };
    imageFilename: string;
  }

  export interface IConfigRemoteButton {
    coords: number[];
  }
}
