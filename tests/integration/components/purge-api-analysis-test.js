import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('purge-api-analysis', 'Integration | Component | purge api analysis', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{purge-api-analysis}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#purge-api-analysis}}
      template block text
    {{/purge-api-analysis}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
