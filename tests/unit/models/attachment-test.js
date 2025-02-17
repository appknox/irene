/* eslint-disable prettier/prettier, qunit/no-early-return */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | attachment', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('attachment');

    assert.ok(!!model);
  });
});
