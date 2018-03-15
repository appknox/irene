import Ember from 'ember';
import localeConfig from 'ember-i18n/config/en';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('user', 'Unit | Model | user', {
  needs: [
    'model:project',
    'model:submission',
    'model:collaboration',
    'model:pricing',
    'model:team',
    'service:i18n',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it exists', function(assert) {
  const user = this.subject();

  Ember.run(function() {
    assert.equal(user.get('provisioningURL'), "otpauth://totp/Appknox:undefined?secret=undefined&issuer=Appknox", "ProvisioningURL");

    assert.equal(user.get('mfaEnabled'), false, "MFA Disabled");
    user.set('mfaMethod', 1);
    assert.equal(user.get('mfaEnabled'), true, "MFA Enabled");

    user.set('projectCount', 2);
    assert.equal(user.get('totalProjects'), "2 projects", "Many Projects");
    user.set('projectCount', 1);
    assert.equal(user.get('totalProjects'), "1 project", "1 Project");
    user.set('projectCount', 0);
    assert.equal(user.get('totalProjects'), "no project", "1 Project");

    assert.equal(user.get('ifBillingIsNotHidden'), true, "Billing Hidden");

    user.set('expiryDate', new Date("25 March 2015"));
    user.set('devknoxExpiry', new Date("25 March 2015"));

    assert.equal(user.get('hasExpiryDate'), true, "Has Expiry Date");
    user.set('getExpiryDate', "");
    assert.equal(user.get('hasExpiryDate'), false, "No Expiry Date");

    assert.equal(user.get('expiryText'), "subscriptionExpired", "Expiry Text");
    user.set('expiryDate', new Date("25 March 2019"));
    assert.equal(user.get('expiryText'), "subscriptionWillExpire", "Expiry Text");

    assert.equal(user.get('namespaceItems'), undefined, "Namespace Items");
  });
});
