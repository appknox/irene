import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | owaspapi2023', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('owaspapi2023', {});
    assert.ok(model);
  });
});
