import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('auth-assets', 'Integration | Component | auth assets', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{auth-assets}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your service');
});
