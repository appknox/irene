import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('prompt-box', 'Integration | Component | prompt box', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{prompt-box}}"));

  assert.equal(this.$().text().trim(), 'undefined');
});
