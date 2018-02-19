import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('namespace-modal', 'Integration | Component | namespace modal', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{namespace-modal}}"));

  assert.equal(this.$().text().trim(), 'Add NamespaceAdd Namespace');
});
