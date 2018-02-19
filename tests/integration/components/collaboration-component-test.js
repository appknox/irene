import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('collaboration-component', 'Integration | Component | collaboration component', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
