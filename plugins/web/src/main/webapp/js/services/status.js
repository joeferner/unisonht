/// <reference path="../_app.ts" />
var unisonht;
(function (unisonht) {
    'use strict';
    var StatusService = (function () {
        function StatusService($http) {
            this.$http = $http;
        }
        StatusService.prototype.getStatus = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.$http.get('/status', {}).success(function (status) {
                    console.log('status', status);
                    resolve(status);
                }).error(function () {
                    console.log('status fail', arguments);
                    reject(new Error('status failed.'));
                });
            });
        };
        return StatusService;
    })();
    unisonht.StatusService = StatusService;
})(unisonht || (unisonht = {}));
//# sourceMappingURL=status.js.map