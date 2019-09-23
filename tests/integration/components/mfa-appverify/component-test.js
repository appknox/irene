import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mfa-appverify', 'Integration | Component | mfa appverify', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mfa-appverify}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mfa-appverify}}
      template block text
    {{/mfa-appverify}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
