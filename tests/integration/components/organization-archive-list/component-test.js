import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('organization-archive-list', 'Integration | Component | organization archive list', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{organization-archive-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#organization-archive-list}}
      template block text
    {{/organization-archive-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
