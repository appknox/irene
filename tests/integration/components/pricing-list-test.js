/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pricing-list', 'Integration | Component | pricing list', {
  integration: true
});

test('it renders', function(assert) {
  assert.ok(true);
  return assert.equal(this.$().text().trim(), '');
});
