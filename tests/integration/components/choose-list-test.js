import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('choose-list', 'Integration | Component | choose list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
