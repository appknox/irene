/* eslint-disable qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | subscription', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function (assert) {
    const subscription = this.owner
      .lookup('service:store')
      .createRecord('subscription');

    const d = new Date('25 March 2015');

    subscription.set('expiryDate', d);

    assert.equal(
      subscription.get('expiryDateOnHumanized'),
      d.toLocaleDateString(),
      'Expiry Date'
    );

    subscription.set('isTrial', true);
    subscription.set('isCancelled', true);

    assert.equal(
      subscription.get('subscriptionText'),
      'Your trial will expire on',
      'Expiry Text'
    );

    subscription.set('isTrial', true);
    subscription.set('isCancelled', false);

    assert.equal(
      subscription.get('subscriptionText'),
      'Your free trial will be converted into paid subscription on',
      'Expiry Text'
    );

    subscription.set('isTrial', false);
    subscription.set('isCancelled', true);

    assert.equal(
      subscription.get('subscriptionText'),
      'Subscription will expire on',
      'Expiry Text'
    );

    subscription.set('isTrial', false);
    subscription.set('isCancelled', false);

    assert.equal(
      subscription.get('subscriptionText'),
      'You will be charged on',
      'Expiry Text'
    );
  });
});
