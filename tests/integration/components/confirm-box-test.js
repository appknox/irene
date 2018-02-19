import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('confirm-box', 'Integration | Component | confirm box', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{confirm-box}}"));

  assert.equal(this.$().text().trim(), 'CancelOk');
});
