import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('invoice-overview', 'Integration | Component | invoice overview', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{invoice-overview}}"));

  assert.equal(this.$().text().trim(), '$  Download');
});
