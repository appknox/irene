import RFB from '@novnc/novnc/lib/rfb';

/**
 * URL that RfbStubWebSocket rejects with a DOMException, used to exercise the
 * vnc-connection modifier's error-handling path.
 */
export const RFB_MALFORMED_URL = 'not-a-real-connection';

/**
 * Lightweight WebSocket stand-in for tests that exercise NoVNC's RFB.
 *
 * Every instance is appended to the static `sockets` array so tests can assert
 * how many connections were opened and to which URL. Reset `sockets` in
 * `beforeEach` to keep tests independent.
 */
export class RfbStubWebSocket {
  static sockets = [];

  binaryType = 'blob';
  onerror = null;
  onmessage = null;
  onopen = null;
  protocol = '';
  readyState = 0;
  closed = false;

  constructor(url) {
    if (url === RFB_MALFORMED_URL) {
      throw new DOMException('invalid url', 'SyntaxError');
    }

    this.url = url;
    RfbStubWebSocket.sockets.push(this);
  }

  send() {} // NOSONAR

  close() {
    this.closed = true;
    this.readyState = 3;
  }
}

/**
 * ResizeObserver stand-in for tests that exercise NoVNC's RFB. RFB watches its
 * screen element for resize events to drive autoscale; a real observer fires on
 * an unpredictable async schedule.
 */
export class RfbStubResizeObserver {
  observe() {} // NOSONAR
  disconnect() {} // NOSONAR
}

/**
 * Replaces a global with an RFB test stub and returns a restore function that
 * undoes the replacement.
 */
export function rfbReplaceGlobal(name, replacement) {
  const original = globalThis[name];
  globalThis[name] = replacement;

  return () => {
    globalThis[name] = original;
  };
}

/**
 * Replaces WebSocket and ResizeObserver with RFB stubs for the duration of
 * `callback`, then restores the originals. Resets RfbStubWebSocket.sockets
 * before each call and passes the live array to the callback so callers can
 * assert on connection count and URLs without managing teardown themselves.
 */
export async function withStubbedRfb(callback) {
  RfbStubWebSocket.sockets = [];

  const restores = [
    rfbReplaceGlobal('WebSocket', RfbStubWebSocket),
    rfbReplaceGlobal('ResizeObserver', RfbStubResizeObserver),
  ];

  try {
    await callback(RfbStubWebSocket.sockets);
  } finally {
    restores.forEach((restore) => restore());
  }
}

/**
 * Wraps RFB.prototype.addEventListener so every RFB instance created by the
 * vnc-connection modifier is captured in `instances`. RFB's own addEventListener
 * is a plain Map-based registry (see util/eventtarget.js), not the native one.
 */
export function rfbCaptureInstances(instances) {
  const original = RFB.prototype.addEventListener;

  RFB.prototype.addEventListener = function (type, callback) {
    if (type === 'connect' && !instances.includes(this)) {
      instances.push(this);
    }

    return original.call(this, type, callback);
  };

  return () => {
    RFB.prototype.addEventListener = original;
  };
}
