/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal, qunit/no-assert-equal-boolean */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function (assert) {
    const user = run(() =>
      this.owner.lookup('service:store').createRecord('user')
    );

    run(function () {
      assert.equal(
        user.get('provisioningURL'),
        'otpauth://totp/Appknox:undefined?secret=undefined&issuer=Appknox',
        'ProvisioningURL'
      );

      assert.equal(user.get('mfaEnabled'), false, 'MFA Disabled');
      
      user.set('mfaMethod', 1);

      assert.equal(user.get('mfaEnabled'), true, 'MFA Enabled');

      user.set('projectCount', 2);

      assert.equal(user.get('totalProjects'), '2 projects', 'Many Projects');

      user.set('projectCount', 1);

      assert.equal(user.get('totalProjects'), '1 project', '1 Project');

      user.set('projectCount', 0);

      assert.equal(user.get('totalProjects'), 'No projects', 'No Project');

      assert.equal(user.get('ifBillingIsNotHidden'), true, 'Billing Hidden');

      user.set('expiryDate', new Date('25 March 2015'));

      user.set('devknoxExpiry', new Date('25 March 2015'));

      assert.equal(user.get('hasExpiryDate'), true, 'Has Expiry Date');

      user.set('expiryDate', '');

      assert.equal(user.get('hasExpiryDate'), false, 'No Expiry Date');

      assert.equal(
        user.get('expiryText'),
        'subscriptionExpired',
        'Expiry Text'
      );

      user.set('expiryDate', new Date('25 March 2019'));

      assert.equal(
        user.get('expiryText'),
        'subscriptionExpired',
        'Expiry Text'
      );

      assert.equal(user.get('namespaceItems'), undefined, 'Namespace Items');
    });
  });
});
