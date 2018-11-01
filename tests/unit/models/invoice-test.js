import { getOwner } from '@ember/application';
import { moduleForModel, test } from 'ember-qunit';
import localeConfig from 'ember-i18n/config/en';
import { run } from '@ember/runloop';

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
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it exists', function(assert) {
  const invoice = this.subject();
  run(function() {
    const d = new Date("25 March 2015");
    invoice.set('paidOn', d);
    assert.equal(invoice.get('paidOnHumanized'), d.toLocaleDateString(), "Paid On");

    assert.equal(invoice.get('paidDate'), "Pending", "Paid Date Pending");
    assert.equal(invoice.get('paidStatus.string'), "Unpaid", "Unpaid");
    invoice.set('isPaid', true);
    assert.equal(invoice.get('paidDate'), d.toLocaleDateString(), "Paid Date");
    assert.equal(invoice.get('paidStatus.string'), "Paid", "Paid");
  });

});
