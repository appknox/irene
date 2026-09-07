import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | available manual device', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('available-manual-device', {});
    assert.ok(model);
  });
});
