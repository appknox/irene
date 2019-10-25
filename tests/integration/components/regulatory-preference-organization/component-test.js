import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('regulatory-preference-organization', 'Integration | Component | regulatory preference organization', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{regulatory-preference-organization}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#regulatory-preference-organization}}
      template block text
    {{/regulatory-preference-organization}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
