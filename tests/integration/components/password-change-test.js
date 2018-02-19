import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('password-change', 'Integration | Component | password change', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{password-change}}"));

  assert.equal(this.$().text().trim(), 'Current PasswordNew PasswordConfirm PasswordChange Password');
});
