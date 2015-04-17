/// <reference path="../_app.ts" />

module unisonht {
  'use strict';

  export class StatusService {
    constructor(private $http:ng.IHttpService) {
    }

    public getStatus():Promise<IStatus> {
      return new Promise<IStatus>((resolve, reject) => {
        this.$http.get('/status', {})
          .success(function (status:IStatus) {
            console.log('status', status);
            resolve(status);
          })
          .error(function () {
            console.log('status fail', arguments);
            reject(new Error('status failed.'));
          });
      });
    }
  }
}
