import { moduleForModel, test } from 'ember-qunit';

moduleForModel('submission', 'Unit | Model | submission', {
  needs: ["model:user"]
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
