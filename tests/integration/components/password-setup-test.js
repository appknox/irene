import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('password-setup', 'Integration | Component | password setup', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{password-setup}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your serviceSet Your PasswordEnter PasswordConfirm PasswordSet Password');
});
