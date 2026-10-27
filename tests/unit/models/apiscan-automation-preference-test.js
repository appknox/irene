import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | apiscan automation preference', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const preference = store.createRecord('apiscan-automation-preference');

    assert.ok(preference);
  });

  test('it holds the API scan automation flag', function (assert) {
    const store = this.owner.lookup('service:store');

    const preference = store.createRecord('apiscan-automation-preference', {
      apiScanAutomationEnabled: true,
    });

    assert.true(preference.apiScanAutomationEnabled);
  });
});
