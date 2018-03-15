import { moduleForModel, test } from 'ember-qunit';

moduleForModel('coupon', 'Unit | Model | coupon', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
