import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('modal-card', 'Integration | Component | modal card', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  this.render(hbs("{{modal-card}}"));

  assert.equal(this.$().text().trim(), 'template block text');
});
