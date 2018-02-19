import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('invoice-list', 'Integration | Component | invoice list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
