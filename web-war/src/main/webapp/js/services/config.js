/// <reference path="../_app.ts" />
var unisonht;
(function (unisonht) {
    'use strict';
    var ConfigService = (function () {
        function ConfigService($http) {
            this.$http = $http;
        }
        ConfigService.prototype.getConfig = function () {
            var me = this;
            return new Promise(function (resolve, reject) {
                if (me.config) {
                    resolve(me.config);
                }
                else {
                    me.$http.get('config').success(function (config) {
                        console.log('config', config);
                        me.config = config;
                        resolve(me.config);
                    }).error(function () {
                        console.log('config fail', arguments);
                        reject(new Error('getting config failed.'));
                    });
                }
            });
        };
        ConfigService.prototype.getRemoteNames = function () {
            return this.getConfig().then(function (config) {
                return Object.keys(config.remotes);
            });
        };
        ConfigService.prototype.getRemote = function (remoteName) {
            return this.getConfig().then(function (config) {
                return config.remotes[remoteName];
            });
        };
        return ConfigService;
    })();
    unisonht.ConfigService = ConfigService;
})(unisonht || (unisonht = {}));
//# sourceMappingURL=config.js.map