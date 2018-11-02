import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';


moduleForComponent('pricing-plan', 'Integration | Component | pricing plan', {
  unit: true,
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
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);

    // register t helper
    this.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{pricing-plan}}"));

  return assert.equal(this.$().text().trim(), '1app(s)Pay $NaN USD');
});


test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  run(function() {
    assert.equal(component.get('planText.string'), "app(s)", "Plan Text/Apps");
    component.set('plan', {planId: "default_per_scan"});
    assert.equal(component.get('planText.string'), "scan(s)", "Plan Text/Scans");

    component.set('plan', {monthlyPrice: "120$"});
    assert.equal(component.get('totalPrice'), "120$", "Total Price/Monthly");
    component.send("initiatePayment");

    component.set('plan', {quarterlyPrice: "240$"});
    component.set('paymentDuration', ENUMS.PAYMENT_DURATION.QUARTERLY);
    assert.equal(component.get('totalPrice'), "240$", "Total Price/Quarterly");
    component.send("initiatePayment");

    component.set('plan', {halfYearlyPrice: "340$"});
    component.set('paymentDuration', ENUMS.PAYMENT_DURATION.HALFYEARLY);
    assert.equal(component.get('totalPrice'), "340$", "Total Price/Half Yearly");
    component.send("initiatePayment");

    component.set('plan', {yearlyPrice: "640$"});
    component.set('paymentDuration', ENUMS.PAYMENT_DURATION.YEARLY);
    assert.equal(component.get('totalPrice'), "640$", "Total Price/Yearly");
    component.send("initiatePayment");

  });
});
