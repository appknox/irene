import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('captured-api-overview', 'Integration | Component | capturedapis overview', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{captured-api-overview}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#captured-api-overview}}
      template block text
    {{/captured-api-overview}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
