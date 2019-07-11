import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('dynamic-scan', 'Integration | Component | dynamic scan', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
