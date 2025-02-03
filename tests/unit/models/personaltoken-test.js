/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | personaltoken', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const personaltoken = this.owner
      .lookup('service:store')
      .createRecord('personaltoken');

    const d = new Date('25 March 2015');

    personaltoken.set('created', d);

    assert.equal(
      personaltoken.get('createdDateOnHumanized'),
      d.toLocaleDateString(),
      'Date Created'
    );
  });
});
