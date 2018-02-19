import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('submission-list', 'Integration | Component | submission list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
