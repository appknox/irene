import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('team-overview', 'Integration | Component | team overview', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
