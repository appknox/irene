import { moduleForModel, test } from 'ember-qunit';

moduleForModel('plan', 'Unit | Model | plan', {
  needs: ['model:invoice']
});

test('it exists', function(assert) {
  const plan = this.subject();
  assert.equal(plan.get('descriptionItems'), undefined, "Description");
});
