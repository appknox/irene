/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | project team', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = this.owner.lookup('service:store').createRecord('project-team');

    assert.ok(!!model);
  });
});
