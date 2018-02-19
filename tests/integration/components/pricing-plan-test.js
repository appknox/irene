import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pricing-plan', 'Integration | Component | pricing plan', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{pricing-plan}}"));

  return assert.equal(this.$().text().trim(), '1app(s)Pay $NaN USD');
});
