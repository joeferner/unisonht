/// <reference path="../_app.ts" />

module unisonht {
  'use strict';

  export class RemoteService {
    constructor(private $http:ng.IHttpService) {
    }

    public doButtonPress(remoteName:string, buttonName:string):Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.$http.post('/remote/' + remoteName + '/' + buttonName + '/press', {})
          .success(function () {
            console.log('doButtonPress', remoteName, buttonName, 'success');
            resolve();
          })
          .error(function () {
            console.log('doButtonPress fail', arguments);
            reject(new Error('doButtonPress failed.'));
          });
      });
    }
  }
}
