/// <reference path="../_app.ts" />
var unisonht;
(function (unisonht) {
    'use strict';
    var StatusCtrl = (function () {
        function StatusCtrl($scope, $templateCache, $compile, statusService) {
            this.$scope = $scope;
            this.$templateCache = $templateCache;
            this.$compile = $compile;
            this.statusService = statusService;
            statusService.getStatus().then(function (status) {
                $scope.status = status;
                $scope.$apply();
            });
        }
        return StatusCtrl;
    })();
    unisonht.StatusCtrl = StatusCtrl;
})(unisonht || (unisonht = {}));
//# sourceMappingURL=status.js.map