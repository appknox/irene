import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('namespace-component', 'Integration | Component | namespace component', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{namespace-component}}"));

  assert.equal(this.$().text().trim(), 'no namespace+ Add NamespaceAdd NamespaceAdd Namespace');
});
