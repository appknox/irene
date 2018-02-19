import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('team-details', 'Integration | Component | team details', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
