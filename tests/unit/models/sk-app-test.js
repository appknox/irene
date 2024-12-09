import { module, test } from 'qunit';

import { setupTest } from 'irene/tests/helpers';

module('Unit | Model | sk app', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('sk-app', {});
    assert.ok(model);
  });
});
