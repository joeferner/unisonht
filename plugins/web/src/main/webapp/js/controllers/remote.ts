/// <reference path="../_app.ts" />

module unisonht {
  'use strict';
  export interface IRemoteCtrlScope extends ng.IScope {
    config: IConfig;
    remoteNames: string[];
    selectedRemoteName: string;
    loadRemote: ()=>void;
  }

  export interface IRemotesCtrlDocument extends Document {
    remoteButtonPress:(buttonKey:string)=>void;
  }

  export class RemoteCtrl {
    constructor(private $scope:IRemoteCtrlScope,
                private configService:ConfigService,
                private remoteService:RemoteService,
                remoteNames:string[]) {
      $scope.remoteNames = remoteNames;
      $scope.selectedRemoteName = $scope.remoteNames[0];
      $scope.loadRemote = this.loadRemote.bind(this);
      this.$scope.loadRemote();
    }

    loadRemote():void {
      var remoteName = this.$scope.selectedRemoteName;
      (<IRemotesCtrlDocument>document).remoteButtonPress = this.remoteButtonPress.bind(this, remoteName);
      $('#remote-image').attr('src', 'config/remote/' + remoteName + '/image');
      this.configService.getRemote(remoteName)
        .then((remote) => {
          $('#remote-image-map').html(this.generateImageMap(remoteName, remote));
        });
    }

    generateImageMap(remoteName:string, remote:IConfigRemote):string {
      var result:string = '';
      Object.keys(remote.buttonMap).forEach((buttonKey)=> {
        var button = remote.buttonMap[buttonKey];
        var coords = button.coords.join(',');
        result += '<area shape="rect" coords="' + coords + '" onclick="document.remoteButtonPress(\'' + buttonKey + '\')" alt="' + buttonKey + '">';
      });
      return result;
    }

    remoteButtonPress(remoteName:string, buttonKey:string):void {
      this.remoteService.doButtonPress(remoteName, buttonKey);
    }
  }
}
