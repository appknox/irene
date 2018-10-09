import { moduleForModel, test } from 'ember-qunit';

moduleForModel('analytics/scancount', 'Unit | Model | analytics/scancount', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
