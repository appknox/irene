/**
 * CyodAdbSession — persists WebUSB ADB connections across components.
 *
 * When a user registers a CYOD device the WebUSB Adb object must survive
 * component teardown (e.g., registration wizard unmounting) so it can be
 * reused for automatic APK install once the scan starts.
 *
 * Sessions expire after TTL_MS of inactivity to avoid leaking USB handles.
 */
import Service from '@ember/service';

import type { AdbLike } from 'irene/utils/webusb-adb-install';

const TTL_MS = 10 * 60 * 1000; // 10 minutes

type SessionEntry = {
  adb: AdbLike;
  serial: string;
  timer: ReturnType<typeof setTimeout>;
};

export default class CyodAdbSessionService extends Service {
  private _sessions = new Map<string, SessionEntry>();

  /**
   * Store an ADB connection for a device serial, replacing any existing entry.
   * The connection will be auto-disposed after TTL_MS of inactivity.
   */
  store(serial: string, adb: AdbLike): void {
    this._evict(serial);

    const timer = setTimeout(() => {
      this._evict(serial);
    }, TTL_MS);

    this._sessions.set(serial, { adb, serial, timer });
  }

  /** Retrieve the stored ADB connection for a serial (if still alive). */
  lookup(serial: string): AdbLike | null {
    const entry = this._sessions.get(serial);
    if (!entry) return null;

    // Refresh TTL on access
    clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      this._evict(serial);
    }, TTL_MS);

    return entry.adb;
  }

  /** Explicitly release a connection (e.g., on scan stop). */
  release(serial: string): void {
    this._evict(serial);
  }

  override willDestroy(): void {
    for (const serial of this._sessions.keys()) {
      this._evict(serial);
    }
    super.willDestroy();
  }

  private _evict(serial: string): void {
    const entry = this._sessions.get(serial);
    if (!entry) return;

    clearTimeout(entry.timer);
    try {
      entry.adb.close();
    } catch {
      // ignore close errors
    }
    this._sessions.delete(serial);
  }
}

declare module '@ember/service' {
  interface Registry {
    'cyod-adb-session': CyodAdbSessionService;
  }
}
