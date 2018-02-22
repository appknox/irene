import { moduleForModel, test } from 'ember-qunit';

moduleForModel('personaltoken', 'Unit | Model | personaltoken', {
  needs: []
});

test('it exists', function(assert) {
  const personaltoken = this.subject();
  personaltoken.set('createdDateOnHumanized', new Date('2016-05-01'));
  assert.equal(personaltoken.get('createdDateOnHumanized'), "Sun May 01 2016 05:30:00 GMT+0530 (IST)", "Date");
});
