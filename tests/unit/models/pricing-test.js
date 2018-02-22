import { moduleForModel, test } from 'ember-qunit';

moduleForModel('pricing', 'Unit | Model | pricing', {
  needs: ['model:invoice']
});

test('it exists', function(assert) {
  const pricing = this.subject();
  assert.equal(pricing.get('descriptionItems'), undefined, "Description");
});
