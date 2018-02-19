import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-details', 'Integration | Component | file details', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
