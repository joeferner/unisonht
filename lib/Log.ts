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
        type: 'file',
        path: '/var/log/unisonht/unisonht.log'
      }
    ]
  });
}
