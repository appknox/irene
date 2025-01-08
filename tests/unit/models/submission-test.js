/* eslint-disable prettier/prettier, qunit/no-assert-equal, qunit/no-assert-equal-boolean */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | submission', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const submission = this.owner
      .lookup('service:store')
      .createRecord('submission');

    assert.equal(submission.get('hasReason'), false, 'Reason');
  });
});
