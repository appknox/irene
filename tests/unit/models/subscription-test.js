import { getOwner } from '@ember/application';
import { moduleForModel, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('subscription', 'Unit | Model | subscription', {
  needs: [
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
  const subscription = this.subject();
  run(function() {
    const d = new Date("25 March 2015");
    subscription.set('expiryDate', d);
    assert.equal(subscription.get('expiryDateOnHumanized'), d.toLocaleDateString(), "Expiry Date");

    subscription.set('isTrial', true);
    subscription.set('isCancelled', true);
    assert.equal(subscription.get('subscriptionText'), "Your trial will expire on", "Expiry Text");
    subscription.set('isCancelled', false);
    assert.equal(subscription.get('subscriptionText'), "You will be charged on", "Expiry Text");
    subscription.set('isTrial', false);
    subscription.set('isCancelled', true);
    assert.equal(subscription.get('subscriptionText'), "Your free trial will be converted into paid subscription on", "Expiry Text");
    subscription.set('isCancelled', false);
    assert.equal(subscription.get('subscriptionText'), "Subscription will expire on", "Expiry Text");
  });
});
