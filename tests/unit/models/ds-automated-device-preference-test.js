import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | ds automated device preference', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('ds-automated-device-preference', {});
    assert.ok(model);
  });
});
