/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | api scan options', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const apiScanOptions = store.createRecord('api-scan-options');

    apiScanOptions.set('apiUrlFilters', 'test.com');

    assert.equal(apiScanOptions.get('apiUrlFilters'), ['test.com'], 'No role');
  });
});
