import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('img-logo', 'Integration | Component | img logo', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  this.render(hbs("{{img-logo}}"));

  assert.equal(this.$().text().trim(), '');
});
