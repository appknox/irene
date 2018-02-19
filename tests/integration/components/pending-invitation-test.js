import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pending-invitation', 'Integration | Component | pending invitation', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{pending-invitation}}"));

  assert.equal(this.$().text().trim(), '');
});
