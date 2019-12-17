import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('organization-archive', 'Integration | Component | organization archive', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{organization-archive}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#organization-archive}}
      template block text
    {{/organization-archive}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
