import { getOwner } from '@ember/application';
import { moduleForModel, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('invoice', 'Unit | Model | invoice', {
  needs: [
    'model:plan',
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
  const invoice = this.subject();
  run(function() {
    const d = new Date("25 March 2015");
    invoice.set('paidOn', d);
    assert.equal(invoice.get('paidOnHumanized'), d.toLocaleDateString(), "Paid On");

    assert.equal(invoice.get('paidDate'), "Pending", "Paid Date Pending");
    assert.equal(invoice.get('paidStatus'), "Unpaid", "Unpaid");
    invoice.set('isPaid', true);
    assert.equal(invoice.get('paidDate'), d.toLocaleDateString(), "Paid Date");
    assert.equal(invoice.get('paidStatus'), "Paid", "Paid");
  });

});
