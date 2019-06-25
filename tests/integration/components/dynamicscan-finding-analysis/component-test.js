import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dynamicscan-finding-analysis', 'Integration | Component | dynamicscan finding analysis', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dynamicscan-finding-analysis}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dynamicscan-finding-analysis}}
      template block text
    {{/dynamicscan-finding-analysis}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
