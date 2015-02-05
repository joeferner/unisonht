/// <reference path="../_app.ts" />

module unisonht {
  'use strict';
  export interface IMainCtrlScope extends ng.IScope {
    alert: IAlert;
    config: IConfig;
  }

  export class MainCtrl {
    constructor(private $scope:IMainCtrlScope,
                private $http:ng.IHttpService,
                private $location:ng.ILocationService,
                private $templateCache:ng.ITemplateCacheService,
                private $compile:ng.ICompileService) {
      $scope.$on('alert', function (event, args) {
        console.log('alert', args);
        var templateScope:IMainCtrlScope = <IMainCtrlScope><any>$scope.$new();
        templateScope.alert = args;
        templateScope.alert.severity = templateScope.alert.severity || 'info';
        var html = $compile($templateCache.get('alert-template'))(templateScope)[0];
        $('#alerts').replaceWith(html);
      });
    }
  }
}