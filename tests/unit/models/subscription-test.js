import Ember from 'ember';
import localeConfig from 'ember-i18n/config/en';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('subscription', 'Unit | Model | subscription', {
  needs: [
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
  const subscription = this.subject();
  Ember.run(function() {
    const d = new Date("25 March 2015");
    subscription.set('expiryDate', d);
    assert.equal(subscription.get('expiryDateOnHumanized'), d.toLocaleDateString(), "Expiry Date");

    subscription.set('isTrial', true);
    subscription.set('isCancelled', true);
    assert.equal(subscription.get('subscriptionText.string'), "Your trial will expire on", "Expiry Text");
    subscription.set('isCancelled', false);
    assert.equal(subscription.get('subscriptionText.string'), "You will be charged on", "Expiry Text");
    subscription.set('isTrial', false);
    subscription.set('isCancelled', true);
    assert.equal(subscription.get('subscriptionText.string'), "Your free trial will be converted into paid subscription on", "Expiry Text");
    subscription.set('isCancelled', false);
    assert.equal(subscription.get('subscriptionText.string'), "Subscription will expire on", "Expiry Text");
  });
});
