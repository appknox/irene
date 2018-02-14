/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('prompt-box', 'Integration | Component | prompt box', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with @set 'myProperty', 'value'
  // Handle any actions with @on 'myAction', (val) ->

  this.render(hbs("{{prompt-box}}"));

  return assert.equal(this.$().text().trim(), 'undefined');
});
