/// <reference path="./_app.ts" />

module unisonht {
  'use strict';
  angular
    .module('unisonhtApp', ['ngRoute'])
    .config([
      '$routeProvider', function ($routeProvider) {
        $routeProvider
          .when('/remotes', {
            templateUrl: 'partials/remotes.html',
            controller: 'RemotesCtrl',
            resolve: {
              remoteNames: function (configService:ConfigService) {
                return configService.getRemoteNames();
              }
            }
          })
          .otherwise({
            redirectTo: '/remotes'
          });
      }
    ])
    .controller('MainCtrl', MainCtrl)
    .controller('RemotesCtrl', RemotesCtrl)
    .service('configService', ConfigService)
    .service('remoteService', RemoteService);
}
