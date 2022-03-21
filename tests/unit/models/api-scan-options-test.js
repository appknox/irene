/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | api scan options', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const apiScanOptions = run(() => this.owner.lookup('service:store').createRecord('api-scan-options'));
    run(function() {
      apiScanOptions.set('apiUrlFilters', "test.com");
      assert.equal(apiScanOptions.get('apiUrlFilterItems'), "test.com", "No role");
    });
  });
});
