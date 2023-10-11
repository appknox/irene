import Service from '@ember/service';

export default class LoggerService extends Service {
  error(...args: unknown[]) {
    console.error(...args);
  }

  warn(...args: unknown[]) {
    console.warn(...args);
  }

  info(...args: unknown[]) {
    console.info(...args);
  }

  debug(...args: unknown[]) {
    console.debug(...args);
  }
}
