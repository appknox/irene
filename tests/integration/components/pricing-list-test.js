import { test, moduleForComponent } from 'ember-qunit';


moduleForComponent('pricing-list', 'Integration | Component | pricing list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
