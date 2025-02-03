/* eslint-disable prettier/prettier, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | pricing', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const pricing = this.owner.lookup('service:store').createRecord('pricing');

    assert.equal(pricing.get('descriptionItems'), undefined, 'Description');
  });
});
