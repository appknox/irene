import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import Service from '@ember/service';

// ─── Stubs ─────────────────────────────────────────────────────────────────────
class LoggerStub extends Service {
  errors = [];

  error(...args) {
    this.errors.push(args);
  }
}

/** Stands in for an `Adb` connection: only `close()` is ever called on it. */
function fakeAdb({ failOnClose = false } = {}) {
  return {
    closeCallCount: 0,

    async close() {
      this.closeCallCount += 1;

      if (failOnClose) {
        throw new Error('device already detached');
      }
    },
  };
}

module('Unit | Service | cyod-adb-session', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:logger', LoggerStub);

    this.logger = this.owner.lookup('service:logger');
    this.session = this.owner.lookup('service:cyod-adb-session');
  });

  // ─── Storing and looking up ──────────────────────────────────────────────────

  test('a stored connection can be looked up by serial', function (assert) {
    const adb = fakeAdb();

    this.session.store('BXCRS21', adb);

    assert.strictEqual(this.session.lookup('BXCRS21'), adb);
  });

  test('an unknown serial looks up as nothing', function (assert) {
    assert.strictEqual(this.session.lookup('nope'), null);
  });

  test('sessions are kept apart by serial', function (assert) {
    const first = fakeAdb();
    const second = fakeAdb();

    this.session.store('AAA', first);
    this.session.store('BBB', second);

    assert.strictEqual(this.session.lookup('AAA'), first);
    assert.strictEqual(this.session.lookup('BBB'), second);
  });

  // ─── Replacing ───────────────────────────────────────────────────────────────

  test('re-registering a serial closes the connection it replaces', async function (assert) {
    const first = fakeAdb();

    this.session.store('BXCRS21', first);
    await settled();

    const second = fakeAdb();

    this.session.store('BXCRS21', second);
    await settled();

    assert.strictEqual(first.closeCallCount, 1, 'the old connection is closed');
    assert.strictEqual(second.closeCallCount, 0);
  });

  test('the replacement survives the eviction of the session it replaced', async function (assert) {
    const first = fakeAdb();

    this.session.store('BXCRS21', first);

    const second = fakeAdb();

    this.session.store('BXCRS21', second);
    await settled();

    assert.strictEqual(
      this.session.lookup('BXCRS21'),
      second,
      'evicting the old entry must not drop the one that replaced it'
    );
  });

  // ─── Releasing ───────────────────────────────────────────────────────────────

  test('releasing closes the connection and forgets it', async function (assert) {
    const adb = fakeAdb();

    this.session.store('BXCRS21', adb);
    await settled();

    this.session.release('BXCRS21');
    await settled();

    assert.strictEqual(adb.closeCallCount, 1);
    assert.strictEqual(this.session.lookup('BXCRS21'), null);
  });

  test('releasing an unknown serial is a no-op', async function (assert) {
    this.session.release('nope');
    await settled();

    assert.deepEqual(this.logger.errors, [], 'nothing is reported');
  });

  test('a connection that fails to close is logged and still forgotten', async function (assert) {
    const adb = fakeAdb({ failOnClose: true });

    this.session.store('BXCRS21', adb);
    await settled();

    this.session.release('BXCRS21');
    await settled();

    assert.strictEqual(this.logger.errors.length, 1, 'the failure is logged');

    assert.strictEqual(
      this.session.lookup('BXCRS21'),
      null,
      'a connection that will not close is dropped rather than leaked'
    );
  });
});
