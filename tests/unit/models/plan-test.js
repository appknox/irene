/* eslint-disable prettier/prettier, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | plan', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const plan = this.owner.lookup('service:store').createRecord('plan');

    assert.equal(plan.get('descriptionItems'), undefined, 'Description');
  });
});
