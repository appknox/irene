import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('vnc-viewer-dynamicscan', 'Integration | Component | vnc viewer dynamicscan', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{vnc-viewer-dynamicscan}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#vnc-viewer-dynamicscan}}
      template block text
    {{/vnc-viewer-dynamicscan}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
