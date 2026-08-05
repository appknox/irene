import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | store-release-readiness-scan', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('store-release-readiness-scan', {});
    assert.ok(model);
  });
});
