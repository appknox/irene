/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | unknown analysis status', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = this.owner
      .lookup('service:store')
      .createRecord('unknown-analysis-status');

    assert.ok(!!model);
  });
});
