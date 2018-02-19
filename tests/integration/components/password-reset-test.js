import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('password-reset', 'Integration | Component | password reset', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{password-reset}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your serviceReset your passwordResetLogin?');
});
