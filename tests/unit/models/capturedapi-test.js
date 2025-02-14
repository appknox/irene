/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | capturedapi', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner
      .lookup('service:store')
      .createRecord('capturedapi');

    assert.ok(!!model);
  });
});
