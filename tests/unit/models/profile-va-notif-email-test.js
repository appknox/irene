import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | profile-va-notif-email', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = this.owner
      .lookup('service:store')
      .createRecord('profile-va-notif-email');

    assert.ok(!!model);
  });
});
