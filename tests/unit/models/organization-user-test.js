/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | organization user', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner
      .lookup('service:store')
      .createRecord('organization-user');

    assert.ok(!!model);
  });
});
