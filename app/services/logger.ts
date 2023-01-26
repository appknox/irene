/* eslint-disable @typescript-eslint/no-explicit-any */
import Service from '@ember/service';

export default class LoggerService extends Service {
  error(...args: any[]) {
    console.error(...args);
  }

  warn(...args: any[]) {
    console.warn(...args);
  }

  info(...args: any[]) {
    console.info(...args);
  }

  debug(...args: any[]) {
    console.debug(...args);
  }
}
