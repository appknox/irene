import { moduleForModel, test } from 'ember-qunit';

moduleForModel('owasp', 'Unit | Model | owasp', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
