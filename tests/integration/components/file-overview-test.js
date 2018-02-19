import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-overview', 'Integration | Component | file overview', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
