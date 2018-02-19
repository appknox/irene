import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-list', 'Integration | Component | file list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
