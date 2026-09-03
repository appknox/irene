import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  waitUntil,
  clearRender,
  click,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  canvas: '[data-test-cyodViewer-canvas]',
  connecting: '[data-test-cyodViewer-connecting]',
  error: '[data-test-cyodViewer-error]',
  retryBtn: '[data-test-cyodViewer-retryBtn]',
};

/**
 * Minimal WebSocket stand-in. It never completes a handshake on its own, so a
 * test drives the state transitions explicitly -- which is the point here: the
 * bug lives entirely in the window between construction and `onopen`.
 */
class FakeWebSocket {
  static instances = [];

  static reset() {
    FakeWebSocket.instances = [];
  }

  static get last() {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
  }

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  onopen = null;
  onclose = null;
  onerror = null;
  onmessage = null;
  binaryType = 'blob';
  closeCallCount = 0;

  constructor(url) {
    this.url = url;
    this.readyState = FakeWebSocket.CONNECTING;
    FakeWebSocket.instances.push(this);
  }

  send() {}

  close() {
    this.closeCallCount++;
    this.readyState = FakeWebSocket.CLOSED;
  }

  // ─── Test drivers ───────────────────────────────────────────────────────────
  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  /** What the browser does to a socket that is closed while still CONNECTING. */
  abort() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onerror?.(new Event('error'));
    this.onclose?.(new CloseEvent('close', { code: 1006 }));
  }
}

const TEMPLATE = hbs`
  <CyodViewer
    @scanToken={{this.scanToken}}
    @platform={{this.platform}}
    @authToken={{this.authToken}}
  />
`;

module('Integration | Component | cyod-viewer', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    FakeWebSocket.reset();

    this.originalWebSocket = window.WebSocket;
    window.WebSocket = FakeWebSocket;

    class DevicefarmStub extends Service {
      urlbase = 'http://devicefarm.test/';
    }

    class LoggerStub extends Service {
      error() {}
      warn() {}
      info() {}
    }

    this.owner.register('service:devicefarm', DevicefarmStub);
    this.owner.register('service:logger', LoggerStub);

    this.setProperties({
      scanToken: 'SCAN123',
      platform: 1,
      authToken: 'auth-token',
    });
  });

  hooks.afterEach(function () {
    window.WebSocket = this.originalWebSocket;
  });

  test('it opens a stream socket for the scan token', async function (assert) {
    await render(TEMPLATE);

    assert.dom(selectors.canvas).exists();
    assert.dom(selectors.connecting).exists();
    assert.strictEqual(FakeWebSocket.instances.length, 1);
    assert.strictEqual(
      FakeWebSocket.last.url,
      'ws://devicefarm.test/devicefarm/ws/scrcpy/SCAN123/?token=auth-token'
    );
  });

  test('the canvas stays mounted in every state', async function (assert) {
    await render(TEMPLATE);

    // Swapping the canvas out tears down the modifier, which closes a socket
    // that may still be connecting -- and leaves nothing to reconnect with.
    assert.dom(selectors.canvas).exists('present while connecting');

    FakeWebSocket.last.open();
    await settled();

    assert.dom(selectors.canvas).exists('present once connected');
    assert.dom(selectors.connecting).doesNotExist();
  });

  test('handlers are detached before a torn-down socket is closed', async function (assert) {
    await render(TEMPLATE);

    const ws = FakeWebSocket.last;
    ws.open();
    await settled();

    await clearRender();

    assert.strictEqual(ws.closeCallCount, 1, 'the socket was closed');
    assert.strictEqual(ws.onopen, null);
    assert.strictEqual(ws.onclose, null);
    assert.strictEqual(ws.onerror, null);
    assert.strictEqual(ws.onmessage, null);
  });

  test('a superseded socket cannot report failure over its replacement', async function (assert) {
    await render(TEMPLATE);

    const first = FakeWebSocket.last;

    first.abort();

    const second = await waitUntil(
      () => (FakeWebSocket.instances.length === 2 ? FakeWebSocket.last : false),
      { timeout: 4000 }
    );

    assert.notStrictEqual(second, first, 'a replacement socket was opened');

    // The abandoned socket fires again after being superseded. Acting on it
    // would surface an error over a connection that is perfectly healthy.
    first.onclose?.(new CloseEvent('close', { code: 1006 }));
    first.onerror?.(new Event('error'));
    await settled();

    assert.dom(selectors.error).doesNotExist();

    second.open();
    await settled();

    assert.dom(selectors.connecting).doesNotExist();
    assert.dom(selectors.error).doesNotExist();
  });

  test('it reconnects after an unexpected close', async function (assert) {
    await render(TEMPLATE);

    const first = FakeWebSocket.last;
    first.open();
    await settled();

    assert.dom(selectors.connecting).doesNotExist();

    first.readyState = FakeWebSocket.CLOSED;
    first.onclose?.(new CloseEvent('close', { code: 1006 }));
    await settled();

    assert
      .dom(selectors.connecting)
      .exists('falls back to the connecting state');
    assert.dom(selectors.error).doesNotExist('a drop is not a hard failure');

    await waitUntil(() => FakeWebSocket.instances.length === 2, {
      timeout: 4000,
    });

    FakeWebSocket.last.open();
    await settled();

    assert.dom(selectors.connecting).doesNotExist();
    assert.dom(selectors.error).doesNotExist();
  });

  test('no socket is opened without a scan token', async function (assert) {
    this.set('scanToken', null);

    await render(TEMPLATE);

    assert.strictEqual(FakeWebSocket.instances.length, 0);
    assert.dom(selectors.canvas).exists();
  });

  test('the retry control is absent while the stream is healthy', async function (assert) {
    await render(TEMPLATE);

    assert.dom(selectors.retryBtn).doesNotExist();

    FakeWebSocket.last.open();
    await settled();

    assert.dom(selectors.retryBtn).doesNotExist();
  });

  test('a socket that cannot be constructed surfaces a retry instead of breaking the render', async function (assert) {
    let shouldThrow = true;

    window.WebSocket = class extends FakeWebSocket {
      constructor(url) {
        if (shouldThrow) {
          throw new SyntaxError('bad url');
        }

        super(url);
      }
    };

    await render(TEMPLATE);

    assert
      .dom(selectors.error)
      .hasTextContaining(t('cyod.viewer.connectionFailed'));
    assert.dom(selectors.canvas).exists('the canvas survives the error state');
    assert.dom(selectors.retryBtn).hasText(t('cyod.viewer.retry'));
    assert.dom(selectors.retryBtn).isNotDisabled();

    shouldThrow = false;

    await click(selectors.retryBtn);

    assert.dom(selectors.error).doesNotExist('retry clears the failure');
    assert.strictEqual(
      FakeWebSocket.instances.length,
      1,
      'retry opens a fresh socket'
    );
  });
});
