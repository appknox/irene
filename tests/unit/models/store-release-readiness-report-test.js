import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | store-release-readiness-report', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('store-release-readiness-report', {});
    assert.ok(model);
  });
});
