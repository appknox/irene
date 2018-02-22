import { moduleForModel, test } from 'ember-qunit';

moduleForModel('user', 'Unit | Model | user', {
  needs: ['model:project', 'model:submission', 'model:collaboration', 'model:pricing','model:team']
});

test('it exists', function(assert) {
  const user = this.subject();
  assert.equal(user.get('provisioningURL'), "otpauth://totp/Appknox:undefined?secret=undefined&issuer=Appknox", "ProvisioningURL");
  assert.equal(user.get('mfaEnabled'), false, "MFA Enabled");
  assert.equal(user.get('ifBillingIsNotHidden'), true, "Billing Hidden");
  assert.equal(user.get('getExpiryDate'), undefined, "Expiry Date");
  assert.equal(user.get('expiryText'), "subscriptionWillExpire", "Expiry Text");
  assert.equal(user.get('namespaceItems'), undefined, "Namespace Items");
});
