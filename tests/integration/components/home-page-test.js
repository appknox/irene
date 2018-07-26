import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('home-page', 'Integration | Component | home page', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
