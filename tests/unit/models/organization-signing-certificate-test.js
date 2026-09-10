import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import dayjs from 'dayjs';

module('Unit | Model | organization-signing-certificate', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    this.push = (...args) => {
      const record = this.server.create('signing-certificate', ...args);

      return this.store.push(
        this.store.normalize(
          'organization-signing-certificate',
          record.toJSON()
        )
      );
    };
  });

  // ─── expiresOn ───────────────────────────────────────────────────────────────

  test('expiresOn formats the expiry with its time', function (assert) {
    const expiresAt = '2027-01-15T09:05:00Z';
    const model = this.push({ expires_at: expiresAt });

    assert.strictEqual(
      model.expiresOn,
      dayjs(expiresAt).format('MMMM D, YYYY, hh:mm A')
    );
  });

  test('expiresOn is empty when the certificate carries no expiry', function (assert) {
    const model = this.push({ expires_at: null });

    assert.strictEqual(model.expiresOn, '');
  });

  // ─── statusColor ─────────────────────────────────────────────────────────────

  test('statusColor is success while the certificate is valid', function (assert) {
    const model = this.push({ is_expired: false });

    assert.strictEqual(model.statusColor, 'success');
  });

  test('statusColor is error once the certificate has expired', function (assert) {
    const model = this.push('withExpiredStatus');

    assert.strictEqual(model.statusColor, 'error');
  });
});
