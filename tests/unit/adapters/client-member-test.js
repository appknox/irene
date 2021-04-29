import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | client member', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let adapter = this.owner.lookup('adapter:client-member');
    assert.ok(adapter);
  });
});
