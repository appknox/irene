import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import localeConfig from 'ember-i18n/config/en';

moduleForModel('invoice', 'Unit | Model | invoice', {
  needs: [
    'model:plan',
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
  const invoice = this.subject();
  Ember.run(function() {
    invoice.set('paidOn', new Date("25 March 2015"));
    assert.equal(invoice.get('paidOnHumanized'), "25 March 2015", "Paid On");

    assert.equal(invoice.get('paidDate'), "Pending", "Paid Date Pending");
    assert.equal(invoice.get('paidStatus.string'), "Unpaid", "Unpaid");
    invoice.set('isPaid', true);
    assert.equal(invoice.get('paidDate'), "25 March 2015", "Paid Date");
    assert.equal(invoice.get('paidStatus.string'), "Paid", "Paid");
  });

});
