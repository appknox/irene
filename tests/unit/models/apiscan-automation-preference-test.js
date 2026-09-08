import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | apiscan automation preference', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const preference = store.createRecord('apiscan-automation-preference');

    assert.ok(preference);
  });

  test('it holds the API scan automation scope', function (assert) {
    const store = this.owner.lookup('service:store');

    const preference = store.createRecord('apiscan-automation-preference', {
      apiScanAutomationEnabled: true,
      apiScanAutomationIncludedDomains: ['api.example.com'],
      apiScanAutomationExcludedDomains: ['analytics.vendor.com'],
      apiScanAutomationExcludedEndpoints: ['/admin/*'],
    });

    assert.true(preference.apiScanAutomationEnabled);

    assert.deepEqual(preference.apiScanAutomationIncludedDomains, [
      'api.example.com',
    ]);

    assert.deepEqual(preference.apiScanAutomationExcludedDomains, [
      'analytics.vendor.com',
    ]);

    assert.deepEqual(preference.apiScanAutomationExcludedEndpoints, [
      '/admin/*',
    ]);
  });
});
