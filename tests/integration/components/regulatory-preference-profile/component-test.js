import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('regulatory-preference-profile', 'Integration | Component | regulatory preference profile', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{regulatory-preference-profile}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#regulatory-preference-profile}}
      template block text
    {{/regulatory-preference-profile}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
