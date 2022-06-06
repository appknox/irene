import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | production scan/table', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('production-scan/table', {});
    assert.ok(model);
  });
});
