import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dynamicscans-overview', 'Integration | Component | dynamicscans overview', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dynamicscans-overview}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dynamicscans-overview}}
      template block text
    {{/dynamicscans-overview}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
