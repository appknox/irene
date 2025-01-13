import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | available automated device', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('available-automated-device', {});
    assert.ok(model);
  });
});
