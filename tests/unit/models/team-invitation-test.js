/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | team invitation', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = this.owner
      .lookup('service:store')
      .createRecord('team-invitation');

    assert.ok(!!model);
  });
});
