import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | api scan options', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const apiScanOptions = store.createRecord('api-scan-options');

    assert.ok(apiScanOptions);
  });

  test('it holds the API scan automation scope', function (assert) {
    const store = this.owner.lookup('service:store');

    const apiScanOptions = store.createRecord('api-scan-options', {
      apiScanAutomationEnabled: true,
      apiScanAutomationIncludedDomains: ['api.example.com'],
      apiScanAutomationExcludedDomains: ['analytics.vendor.com'],
      apiScanAutomationExcludedEndpoints: ['/admin/*'],
    });

    assert.true(apiScanOptions.apiScanAutomationEnabled);

    assert.deepEqual(apiScanOptions.apiScanAutomationIncludedDomains, [
      'api.example.com',
    ]);

    assert.deepEqual(apiScanOptions.apiScanAutomationExcludedDomains, [
      'analytics.vendor.com',
    ]);

    assert.deepEqual(apiScanOptions.apiScanAutomationExcludedEndpoints, [
      '/admin/*',
    ]);
  });

  test('hasApiUrlFilters reflects the capture filters', function (assert) {
    const store = this.owner.lookup('service:store');

    const apiScanOptions = store.createRecord('api-scan-options', {
      dsApiCaptureFilters: [],
    });

    assert.false(apiScanOptions.hasApiUrlFilters);

    apiScanOptions.set('dsApiCaptureFilters', ['example.com']);

    assert.true(apiScanOptions.hasApiUrlFilters);
  });
});
