import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | invoice', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function(assert) {
    const invoice = run(() => this.owner.lookup('service:store').createRecord('invoice'));
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
});
