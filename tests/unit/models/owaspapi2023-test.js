import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | owaspapi2023', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('owaspapi2023', {});
    assert.ok(model);
  });
});
