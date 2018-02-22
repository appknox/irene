import { moduleForModel, test } from 'ember-qunit';

moduleForModel('subscription', 'Unit | Model | subscription', {
  needs: []
});

test('it exists', function(assert) {
  const subscription = this.subject();
  subscription.set('expiryDateOnHumanized', new Date('2016-05-01'));
  assert.equal(subscription.get('expiryDateOnHumanized'), "Sun May 01 2016 05:30:00 GMT+0530 (IST)", "Date");
});
