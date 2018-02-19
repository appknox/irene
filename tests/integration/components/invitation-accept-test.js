import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('invitation-accept', 'Integration | Component | invitation accept', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{invitation-accept}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your serviceSignup & Accept Invite has invited you to  teamSignup & Accept InviteLogin?');
});
