import Service from '@ember/service';

export default class LoggerService extends Service {
  error(...args) {
    console.error(...args);
  }

  warn(...args) {
    console.warn(...args);
  }

  info(...args) {
    console.info(...args);
  }

  debug(...args) {
    console.debug(...args);
  }
}
