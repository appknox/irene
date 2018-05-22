import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dynamic-scan', 'Integration | Component | dynamic scan', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dynamic-scan}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dynamic-scan}}
      template block text
    {{/dynamic-scan}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
