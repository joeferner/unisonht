/// <reference path="../typings/index.d.ts" />

import {createLogger as bunyanCreateLogger} from "bunyan";

export default function createLogger(name: string) {
  return bunyanCreateLogger({
    name: name,
    level: 'debug'
  });
}
