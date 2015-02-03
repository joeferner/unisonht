/// <reference path="../_app.ts" />
var unisonht;
(function (unisonht) {
    'use strict';
    var RemoteService = (function () {
        function RemoteService($http) {
            this.$http = $http;
        }
        RemoteService.prototype.doButtonPress = function (remoteName, buttonName) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.$http.post('/remote/' + remoteName + '/' + buttonName + '/press', {}).success(function () {
                    console.log('doButtonPress', remoteName, buttonName, 'success');
                    resolve();
                }).error(function () {
                    console.log('doButtonPress fail', arguments);
                    reject(new Error('doButtonPress failed.'));
                });
            });
        };
        return RemoteService;
    })();
    unisonht.RemoteService = RemoteService;
})(unisonht || (unisonht = {}));
//# sourceMappingURL=remote.js.map