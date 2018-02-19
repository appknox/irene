import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('activity-log', 'Integration | Component | activity log', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
