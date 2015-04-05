/// <reference path="../_app.ts" />
var unisonht;
(function (unisonht) {
    'use strict';
    var RemotesCtrl = (function () {
        function RemotesCtrl($scope, configService, remoteService, remoteNames) {
            this.$scope = $scope;
            this.configService = configService;
            this.remoteService = remoteService;
            $scope.remoteNames = remoteNames;
            $scope.selectedRemoteName = $scope.remoteNames[0];
            $scope.loadRemote = this.loadRemote.bind(this);
            this.$scope.loadRemote();
        }
        RemotesCtrl.prototype.loadRemote = function () {
            var _this = this;
            var remoteName = this.$scope.selectedRemoteName;
            document.remoteButtonPress = this.remoteButtonPress.bind(this, remoteName);
            $('#remote-image').attr('src', 'config/remote/' + remoteName + '/image');
            this.configService.getRemote(remoteName).then(function (remote) {
                $('#remote-image-map').html(_this.generateImageMap(remoteName, remote));
            });
        };
        RemotesCtrl.prototype.generateImageMap = function (remoteName, remote) {
            var result = '';
            Object.keys(remote.buttonMap).forEach(function (buttonKey) {
                var button = remote.buttonMap[buttonKey];
                var coords = button.coords.join(',');
                result += '<area shape="rect" coords="' + coords + '" onclick="document.remoteButtonPress(\'' + buttonKey + '\')" alt="' + buttonKey + '">';
            });
            return result;
        };
        RemotesCtrl.prototype.remoteButtonPress = function (remoteName, buttonKey) {
            this.remoteService.doButtonPress(remoteName, buttonKey);
        };
        return RemotesCtrl;
    })();
    unisonht.RemotesCtrl = RemotesCtrl;
})(unisonht || (unisonht = {}));
//# sourceMappingURL=remotes.js.map