import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('recent-issues', 'Integration | Component | recent issues', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
