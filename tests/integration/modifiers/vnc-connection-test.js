import { render, clearRender, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import {
  RfbStubWebSocket,
  RfbStubResizeObserver,
  rfbReplaceGlobal,
  rfbCaptureInstances,
  RFB_MALFORMED_URL,
} from 'irene/tests/helpers/rfb-stubs';

const SEL = {
  canvas: '[data-test-target] canvas',
};

const TEMPLATE = hbs`
  <div
    data-test-target
    {{vnc-connection
      url=this.url
      password=this.testPassword
      allowInteraction=this.allowInteraction
    }}
  />
`;

const VALID_URL = 'ws://device-farm.test/socket';
const OTHER_URL = 'ws://device-farm.test/another-socket';

// ─── Suite ────────────────────────────────────────────────────────────────────

module('Integration | Modifier | vnc-connection', function (hooks) {
  setupRenderingTest(hooks);

  let rfbInstances;
  let restores;

  hooks.beforeEach(function () {
    RfbStubWebSocket.sockets = [];
    rfbInstances = [];

    restores = [
      rfbReplaceGlobal('WebSocket', RfbStubWebSocket),
      rfbReplaceGlobal('ResizeObserver', RfbStubResizeObserver),
      rfbCaptureInstances(rfbInstances),
    ];

    this.setProperties({
      url: null,
      testPassword: null,
      allowInteraction: false,
    });
  });

  hooks.afterEach(function () {
    restores.forEach((restore) => restore());
  });

  // Renders the host element with the given args and returns the latest RFB
  // instance the modifier created (if any).
  async function connect(context, props) {
    context.setProperties(props);

    await render(TEMPLATE);

    return rfbInstances.at(-1);
  }

  // Updates args on the *same* already-rendered element — the way a real
  // arg change would happen (e.g. switching the selected scan). Deliberately
  // does not call `render()` again, which would tear down and recreate the
  // whole tree via Ember's outlet state.
  async function updateArgs(context, props) {
    context.setProperties(props);

    await settled();

    return rfbInstances.at(-1);
  }

  // ─── Tests ──────────────────────────────────────────────────────────────────

  test.each(
    'connects only for a url RFB can actually construct',
    [
      { url: VALID_URL, socketCount: 1, hasCanvas: true },
      { url: null, socketCount: 0, hasCanvas: false },
      // Throws synchronously inside `new RFB()`; the modifier catches it.
      { url: RFB_MALFORMED_URL, socketCount: 0, hasCanvas: false },
    ],
    async function (assert, { url, socketCount, hasCanvas }) {
      await connect(this, { url });

      assert.strictEqual(RfbStubWebSocket.sockets.length, socketCount);
      assert.dom(SEL.canvas)[hasCanvas ? 'exists' : 'doesNotExist']();
    }
  );

  test.each(
    'maps the password arg to RFB credentials',
    [
      { password: null, credentials: {} },
      { password: 'super-secret', credentials: { password: 'super-secret' } },
    ],
    async function (assert, { password, credentials }) {
      const rfb = await connect(this, {
        url: VALID_URL,
        testPassword: password,
      });

      assert.deepEqual(rfb._rfbCredentials, credentials);
    }
  );

  test.each(
    'sets viewOnly to the inverse of allowInteraction',
    [
      { allowInteraction: false, viewOnly: true },
      { allowInteraction: true, viewOnly: false },
      { allowInteraction: undefined, viewOnly: true },
    ],
    async function (assert, { allowInteraction, viewOnly }) {
      const rfb = await connect(this, { url: VALID_URL, allowInteraction });

      assert.strictEqual(rfb.viewOnly, viewOnly);
    }
  );

  test('scales the viewport on connect, then stops listening', async function (assert) {
    const rfb = await connect(this, { url: VALID_URL });

    let autoscaleCalls = 0;
    const originalAutoscale = rfb._display.autoscale.bind(rfb._display);

    rfb._display.autoscale = (...args) => {
      autoscaleCalls++;
      return originalAutoscale(...args);
    };

    assert.false(rfb.scaleViewport, 'viewport scaling is off before connect');

    rfb.dispatchEvent(new CustomEvent('connect'));

    assert.true(rfb.scaleViewport, 'viewport scaling turns on after connect');

    // RFB's own `scaleViewport` setter calls `_updateScale` (→ `autoscale`)
    // as a side effect, and `onConnect` then calls `autoscale` again
    // explicitly — two real calls per connect, not a test artifact.
    assert.strictEqual(autoscaleCalls, 2, 'autoscale runs on connect');

    rfb.dispatchEvent(new CustomEvent('connect'));

    assert.strictEqual(
      autoscaleCalls,
      2,
      'the connect handler does not run again'
    );
  });

  test('reconnects when the url changes: disconnects the old socket and connects a new one', async function (assert) {
    const firstRfb = await connect(this, { url: VALID_URL });

    assert.strictEqual(RfbStubWebSocket.sockets.length, 1);

    const secondRfb = await updateArgs(this, { url: OTHER_URL });

    assert.strictEqual(
      RfbStubWebSocket.sockets.length,
      2,
      'a new socket is opened'
    );
    assert.true(RfbStubWebSocket.sockets[0].closed, 'the old socket is closed');

    assert.strictEqual(rfbInstances.length, 2, 'a new RFB instance is created');
    assert.notStrictEqual(secondRfb, firstRfb);
  });

  test('disconnects and removes the canvas when the url changes to null', async function (assert) {
    await connect(this, { url: VALID_URL });

    assert.dom(SEL.canvas).exists();

    await updateArgs(this, { url: null });

    assert.true(RfbStubWebSocket.sockets[0].closed, 'the socket is closed');
    assert.dom(SEL.canvas).doesNotExist('the canvas is removed');
  });

  test('disconnects on element teardown', async function (assert) {
    await connect(this, { url: VALID_URL });

    assert.false(RfbStubWebSocket.sockets[0].closed);

    await clearRender();

    assert.true(
      RfbStubWebSocket.sockets[0].closed,
      'the socket is closed on teardown'
    );
  });

  test('does not throw when disconnect() itself throws during teardown', async function (assert) {
    const rfb = await connect(this, { url: VALID_URL });
    const originalDisconnect = rfb.disconnect.bind(rfb);

    rfb.disconnect = () => {
      originalDisconnect();
      throw new Error('already disconnected');
    };

    await clearRender();

    assert.true(
      RfbStubWebSocket.sockets[0].closed,
      'cleanup still closed the socket before the throw'
    );
  });
});
