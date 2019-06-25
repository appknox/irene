import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dynamicscan-timeline-scrollable', 'Integration | Component | dynamicscan timeline scrollable', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dynamicscan-timeline-scrollable}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dynamicscan-timeline-scrollable}}
      template block text
    {{/dynamicscan-timeline-scrollable}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
