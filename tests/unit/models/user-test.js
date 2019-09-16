import { getOwner } from '@ember/application';
import { moduleForModel, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('user', 'Unit | Model | user', {
  needs: [
    'model:project',
    'model:submission',
    'model:pricing',
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');
  }
});

test('it exists', function(assert) {
  const user = this.subject();

  run(function() {
    assert.equal(user.get('provisioningURL'), "otpauth://totp/Appknox:undefined?secret=undefined&issuer=Appknox", "ProvisioningURL");

    assert.equal(user.get('mfaEnabled'), false, "MFA Disabled");
    user.set('mfaMethod', 1);
    assert.equal(user.get('mfaEnabled'), true, "MFA Enabled");

    user.set('projectCount', 2);
    assert.equal(user.get('totalProjects'), "2 projects", "Many Projects");
    user.set('projectCount', 1);
    assert.equal(user.get('totalProjects'), "1 project", "1 Project");
    user.set('projectCount', 0);
    assert.equal(user.get('totalProjects'), "No projects", "No Project");

    assert.equal(user.get('ifBillingIsNotHidden'), true, "Billing Hidden");

    user.set('expiryDate', new Date("25 March 2015"));
    user.set('devknoxExpiry', new Date("25 March 2015"));

    assert.equal(user.get('hasExpiryDate'), true, "Has Expiry Date");
    user.set('getExpiryDate', "");
    assert.equal(user.get('hasExpiryDate'), false, "No Expiry Date");

    assert.equal(user.get('expiryText'), "subscriptionExpired", "Expiry Text");
    user.set('expiryDate', new Date("25 March 2019"));
    assert.equal(user.get('expiryText'), "subscriptionExpired", "Expiry Text");

    assert.equal(user.get('namespaceItems'), undefined, "Namespace Items");
  });
});
