import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | store-release-readiness-scan', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('store-release-readiness-scan', {});
    assert.ok(model);
  });
});
