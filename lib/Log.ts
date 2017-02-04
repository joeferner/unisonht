import * as Logger from "bunyan";

export function createLogger(name: string): Logger {
  return Logger.createLogger({
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
