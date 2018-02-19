import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('create-team', 'Integration | Component | create team', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
