import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Service, { service } from '@ember/service';
import type { Adb } from '@yume-chan/adb';

import parseError from 'irene/utils/parse-error';
import type LoggerService from 'irene/services/logger';

const TTL_MS = 10 * 60 * 1000; // 10 minutes

type SessionEntry = {
  adb: Adb;
  serial: string;
  timer: ReturnType<typeof setTimeout>;
};

export default class CyodAdbSessionService extends Service {
  @service declare logger: LoggerService;

  private readonly sessions = new Map<string, SessionEntry>();

  @action
  store(serial: string, adb: Adb) {
    this.evict.perform(serial);

    const timer = setTimeout(() => this.evict.perform(serial), TTL_MS);
    this.sessions.set(serial, { adb, serial, timer });
  }

  @action
  lookup(serial: string) {
    const entry = this.sessions.get(serial);

    if (!entry) {
      return null;
    }

    clearTimeout(entry.timer);

    entry.timer = setTimeout(() => {
      this.evict.perform(serial);
    }, TTL_MS);

    return entry.adb;
  }

  @action
  release(serial: string) {
    this.evict.perform(serial);
  }

  private readonly evict = task(async (serial: string) => {
    const entry = this.sessions.get(serial);

    if (!entry) {
      return;
    }

    clearTimeout(entry.timer);

    try {
      await entry.adb.close();
    } catch (error) {
      this.logger.error(parseError(error));
    }

    // `store` evicts the old session and writes the new one synchronously, so
    // by the time the close above resolves the map may already hold a
    // replacement. Only drop the entry this eviction actually closed.
    if (this.sessions.get(serial) === entry) {
      this.sessions.delete(serial);
    }
  });

  willDestroy() {
    super.willDestroy();

    for (const serial of this.sessions.keys()) {
      this.evict.perform(serial);
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'cyod-adb-session': CyodAdbSessionService;
  }
}
