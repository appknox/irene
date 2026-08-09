import Service from '@ember/service';
import type { Adb } from '@yume-chan/adb';

const TTL_MS = 10 * 60 * 1000; // 10 minutes

type SessionEntry = {
  adb: Adb;
  serial: string;
  timer: ReturnType<typeof setTimeout>;
};

export default class CyodAdbSessionService extends Service {
  private sessions = new Map<string, SessionEntry>();

  store(serial: string, adb: Adb): void {
    this.evict(serial);

    const timer = setTimeout(() => {
      this.evict(serial);
    }, TTL_MS);

    this.sessions.set(serial, { adb, serial, timer });
  }

  lookup(serial: string): Adb | null {
    const entry = this.sessions.get(serial);
    if (!entry) {
      return null;
    }

    clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      this.evict(serial);
    }, TTL_MS);

    return entry.adb;
  }

  release(serial: string): void {
    this.evict(serial);
  }

  override willDestroy(): void {
    for (const serial of this.sessions.keys()) {
      this.evict(serial);
    }
    super.willDestroy();
  }

  private evict(serial: string): void {
    const entry = this.sessions.get(serial);
    if (!entry) {
      return;
    }

    clearTimeout(entry.timer);
    try {
      entry.adb.close();
    } catch {
      // the handle is being dropped either way
    }
    this.sessions.delete(serial);
  }
}

declare module '@ember/service' {
  interface Registry {
    'cyod-adb-session': CyodAdbSessionService;
  }
}
