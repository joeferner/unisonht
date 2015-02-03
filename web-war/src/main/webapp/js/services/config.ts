/// <reference path="../_app.ts" />

module unisonht {
  'use strict';

  export class ConfigService {
    config:IConfig;

    constructor(private $http:ng.IHttpService) {
    }

    public getConfig():Promise<IConfig> {
      var me = this;
      return new Promise<IConfig>(function (resolve, reject) {
        if (me.config) {
          resolve(me.config);
        } else {
          me.$http.get('config')
            .success(function (config:IConfig) {
              console.log('config', config);
              me.config = config;
              resolve(me.config);
            })
            .error(function () {
              console.log('config fail', arguments);
              reject(new Error('getting config failed.'));
            });
        }
      });
    }

    public getRemoteNames():Promise<string[]> {
      return this.getConfig()
        .then(function (config) {
          return Object.keys(config.remotes);
        });
    }

    public getRemote(remoteName:string):Promise<IConfigRemote> {
      return this.getConfig()
        .then(function (config) {
          return config.remotes[remoteName];
        });
    }
  }
}
