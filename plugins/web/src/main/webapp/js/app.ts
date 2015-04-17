/// <reference path="./_app.ts" />

module unisonht {
  'use strict';
  angular
    .module('unisonhtApp', ['ngRoute'])
    .config([
      '$routeProvider', function ($routeProvider) {
        $routeProvider
          .when('/', {
            templateUrl: 'partials/main.html',
            controller: 'RemoteCtrl',
            resolve: {
              remoteNames: function (configService:ConfigService) {
                return configService.getRemoteNames();
              }
            }
          })
          .otherwise({
            redirectTo: '/'
          });
      }
    ])
    .controller('MainCtrl', MainCtrl)
    .controller('StatusCtrl', StatusCtrl)
    .controller('RemoteCtrl', RemoteCtrl)
    .service('configService', ConfigService)
    .service('remoteService', RemoteService)
    .service('statusService', StatusService);
}
