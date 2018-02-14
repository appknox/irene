/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('namespace-modal', 'Integration | Component | namespace modal', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with @set 'myProperty', 'value'
  // Handle any actions with @on 'myAction', (val) ->

  this.render(hbs("{{namespace-modal}}"));

  return assert.equal(this.$().text().trim(), 'Add NamespaceAdd Namespace');
});
