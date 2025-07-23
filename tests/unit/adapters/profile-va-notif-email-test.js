import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | profile va notif email', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:profile-va-notif-email');
    assert.ok(adapter);
  });
});
