/// <reference path="../typings/index.d.ts" />

import {createLogger as bunyanCreateLogger} from "bunyan";

export default function createLogger(name: string) {
  return bunyanCreateLogger({
    name: name,
    level: 'debug',
    streams: [
      {
        stream: process.stdout
      },
      {
        type: 'rotating-file',
        path: '/var/log/unisonht/unisonht.log',
        period: '1h',
        count: 3
      }
    ]
  });
}
