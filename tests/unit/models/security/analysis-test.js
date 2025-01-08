/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | security/analysis', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = this.owner
      .lookup('service:store')
      .createRecord('security/analysis');

    assert.ok(!!model);
  });
});
