import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('project-overview', 'Integration | Component | project overview', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
