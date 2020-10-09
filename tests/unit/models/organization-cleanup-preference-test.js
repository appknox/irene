import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | organization cleanup preference', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('organization-cleanup-preference', {});
    assert.ok(model);
  });
});
