/// <reference path="../unisonht.d.ts" />

import {createLogger} from "bunyan";

const log = createLogger({
  name: "unisonht",
  level: 'debug'
});

export default log;
