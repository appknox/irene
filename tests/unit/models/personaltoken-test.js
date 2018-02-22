import { moduleForModel, test } from 'ember-qunit';

moduleForModel('personaltoken', 'Unit | Model | personaltoken', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
  // personaltoken.set('createdDateOnHumanized', new Date('2016-05-01'));
  // assert.equal(personaltoken.get('createdDateOnHumanized'), "2016-05-01T00:00:00.000Z", "Date");
});
