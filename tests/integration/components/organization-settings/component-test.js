import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('organization-settings', 'Integration | Component | organization settings', {
  integration: true
});

test('it renders', function(assert) {
  this.set('org', {id: 1, mandatoryMfa: false})
  this.render(hbs`{{organization-settings organization=org}}`);
  assert.equal(this.$().text().trim(), 'Enable mandatory MFABy enabling this you are mandating multi factor authentication for all users in this organization. Members who do not have MFA enabled in their user account will receive OTP via the registered email.');
});
