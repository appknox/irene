import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('organization-list', 'Integration | Component | organization list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
