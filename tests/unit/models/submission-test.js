import { moduleForModel, test } from 'ember-qunit';

moduleForModel('submission', 'Unit | Model | submission', {
  needs: ["model:user"]
});

test('it exists', function(assert) {
  const submission = this.subject();
  assert.equal(submission.get('hasReason'), false, "Reason");
});
