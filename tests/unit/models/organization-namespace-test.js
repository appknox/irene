/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | organization namespace', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner
      .lookup('service:store')
      .createRecord('organization-namespace');

    assert.ok(!!model);
  });
});
