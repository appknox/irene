import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-header', 'Integration | Component | file header', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
