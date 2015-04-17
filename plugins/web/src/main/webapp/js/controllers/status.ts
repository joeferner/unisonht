/// <reference path="../_app.ts" />

module unisonht {
  'use strict';
  export interface IStatusCtrlScope extends ng.IScope {
    status: IStatus;
  }

  export class StatusCtrl {
    constructor(private $scope:IStatusCtrlScope,
                private $templateCache:ng.ITemplateCacheService,
                private $compile:ng.ICompileService,
                private statusService:StatusService) {
      statusService.getStatus().then(function (status) {
        $scope.status = status;
        $scope.$apply();
      });
    }
  }
}
