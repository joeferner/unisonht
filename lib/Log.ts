import * as Logger from "bunyan";

export function createLogger(name: string): Logger {
  let options = {
    name: name,
    level: 'debug',
    streams: []
  };
  options.streams.push({
    stream: process.stdout
  });
  if (process.env.LOG_FILE) {
    options.streams.push({
      type: 'file',
      path: process.env.LOG_FILE
    });
  }
  if (process.env.LOGSTASH_HOST) {
    options.streams.push({
      type: 'raw',
      stream: require('bunyan-logstash').createStream({
        host: process.env.LOGSTASH_HOST,
        port: process.env.LOGSTASH_PORT || 5505
      })
    });
  }
  return Logger.createLogger(options);
}
