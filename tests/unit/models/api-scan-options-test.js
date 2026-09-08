import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | api scan options', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const apiScanOptions = store.createRecord('api-scan-options');

    assert.ok(apiScanOptions);
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
