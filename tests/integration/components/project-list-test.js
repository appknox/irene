import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('project-list', 'Integration | Component | project list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  return assert.equal(this.$().text().trim(), '');
});
