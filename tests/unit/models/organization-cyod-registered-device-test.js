import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import dayjs from 'dayjs';

module('Unit | Model | organization-cyod-registered-device', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    this.push = (attrs) => {
      const record = this.server.create(
        'organization-cyod-registered-device',
        attrs
      );

      return this.store.push(
        this.store.normalize(
          'organization-cyod-registered-device',
          record.toJSON()
        )
      );
    };
  });

  // ─── deviceName ────────────────────────────────────────────────────────────

  test('deviceName prefers the name', function (assert) {
    const model = this.push({ name: 'Studio Pixel', model: 'Pixel 8' });

    assert.strictEqual(model.deviceName, 'Studio Pixel');
  });

  test('deviceName falls back to the model when unnamed', function (assert) {
    const model = this.push({ name: null, model: 'Pixel 8' });

    assert.strictEqual(model.deviceName, 'Pixel 8');
  });

  test('deviceName falls back to the serial number when unnamed and modelless', function (assert) {
    const model = this.push({
      name: null,
      model: '',
      serial_number: 'BXCRS21',
    });

    assert.strictEqual(model.deviceName, 'BXCRS21');
  });

  // ─── registeredOn ──────────────────────────────────────────────────────────

  test('registeredOn formats the registration date', function (assert) {
    const createdOn = '2026-09-04T10:30:00Z';
    const model = this.push({ created_on: createdOn });

    assert.strictEqual(
      model.registeredOn,
      dayjs(createdOn).format('D MMMM YYYY')
    );
  });

  test('registeredOn renders a dash when the device has no date', function (assert) {
    const model = this.push({ created_on: null });

    assert.strictEqual(model.registeredOn, '-');
  });
});
