import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  render
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';
import {
  setupMirage
} from "ember-cli-mirage/test-support";
import {
  setupIntl
} from 'ember-intl/test-support';
import dayjs from 'dayjs';

module('Integration | Component | partner/client-info/plan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('Per App payment plan interpreted properly', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    const clientPlan = this.server.create('partnerclient-plan');
    clientPlan.limitedScans = false;
    clientPlan.isPaymentExpired = false;
    this.set('clientPlan', clientPlan);
    await render(hbs `<Partner::ClientInfo::Plan @clientPlan={{this.clientPlan}}/>`);
    assert.dom('span[data-test-payment-type]').hasText('t:perApp:()');
    assert.dom('span[data-test-payment-type]').hasStyle({
      'background-color': 'rgb(102, 187, 106)'
    })
    assert.dom('strong[data-test-payment-data="per-app"]').hasText(`${this.clientPlan.projectsLimit} t:pluralApps:("itemCount":${this.clientPlan.projectsLimit})`)
    assert.dom('span[data-test-expiry-date]').hasText(`t:expiresOn:() ${dayjs(this.clientPlan.expiryDate).format('DD MMM YYYY')}`, 'Future date should show "expires on"');

    assert.dom('strong[data-test-payment-data="per-scan"]').doesNotExist("Per Scan container shouldn't be rendered")
  });

  test('Per Scan payment plan interpreted properly', async function (assert) {
    const clientPlan = this.server.create('partnerclient-plan');
    clientPlan.limitedScans = true;
    this.set('clientPlan', clientPlan);
    await render(hbs `<Partner::ClientInfo::Plan @clientPlan={{this.clientPlan}}/>`);
    assert.dom('span[data-test-payment-type]').hasText('t:perScan:()', 'Label shown properly');
    assert.dom('span[data-test-payment-type]').hasStyle({
      'background-color': 'rgb(3, 98, 177)'
    }, "per scan backgrond color")
    assert.dom('strong[data-test-payment-data="per-scan"]').hasText(`${this.clientPlan.scansLeft} t:pluralScans:("itemCount":${this.clientPlan.scansLeft})`)
    assert.dom('span[data-test-payment-remaining]').hasText(`t:remaining:()`);

    assert.dom('strong[data-test-payment-data="per-app"]').doesNotExist("Per App container shouldn't be rendered")
  });

  test('Invalid payment should be handled', async function (assert) {
    const clientPlan = this.server.create('partnerclient-plan');
    clientPlan.invalidPayment = true;
    this.set('clientPlan', clientPlan);
    await render(hbs `<Partner::ClientInfo::Plan @clientPlan={{this.clientPlan}}/>`);
    assert.dom('span[data-test-invalid-payment]').hasText(`t:invalidPayment:()`, "Show invalid payment text")
    assert.dom('span[data-test-payment-data-container]').doesNotExist("Payment data container should not rendered")
  })
});
