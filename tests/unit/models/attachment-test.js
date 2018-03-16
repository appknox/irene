import { moduleForModel, test } from 'ember-qunit';

moduleForModel('attachment', 'Unit | Model | attachment', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  return assert.ok(!!model);
});
