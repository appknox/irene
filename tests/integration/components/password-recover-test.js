import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('password-recover', 'Integration | Component | password recover', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{password-recover}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your serviceRecover your passwordRecoverLogin?');
});
