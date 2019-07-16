import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('captured-apis', 'Integration | Component | captured apis', {
  integration: true
});

test('dummy test', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
