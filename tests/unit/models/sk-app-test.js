import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import ENUMS from 'irene/enums';

module('Unit | Model | sk app', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sk-app', {});
    assert.ok(model);
  });
});

module('Unit | Model | sk-app | decommissioned', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    this.build = (attrs = {}) => this.store.createRecord('sk-app', attrs);
  });

  test('DECOMMISSIONED is 3', function (assert) {
    assert.strictEqual(ENUMS.SK_APP_STATUS.DECOMMISSIONED, 3);
  });

  test('the filter value is 4', function (assert) {
    assert.strictEqual(ENUMS.SK_APP_MONITORING_STATUS_FILTER.DECOMMISSIONED, 4);
  });

  test('isDecommissioned reflects app_status', function (assert) {
    const app = this.build({
      appStatus: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
    });

    assert.true(app.isDecommissioned);
  });

  test('an active app is not decommissioned', function (assert) {
    const app = this.build({ appStatus: ENUMS.SK_APP_STATUS.ACTIVE });

    assert.false(app.isDecommissioned);
  });

  test('isReadOnly covers archived and decommissioned', function (assert) {
    const decommissioned = this.build({
      appStatus: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
    });
    const active = this.build({ appStatus: ENUMS.SK_APP_STATUS.ACTIVE });

    assert.true(decommissioned.isReadOnly, 'decommissioned is read-only');
    assert.false(active.isReadOnly, 'active is not');
  });
});
