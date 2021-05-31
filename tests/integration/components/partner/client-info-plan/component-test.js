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
import faker from 'faker';

module('Integration | Component | partner/client-info-plan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it renders loading spinner', async function (assert) {
    await render(hbs`<Partner::ClientInfoPlan @isLoading={{true}}/>`);
    assert.dom('div[data-test-loading-spinner]').exists();
    assert.dom('div[data-test-plan]').doesNotExist();
  })

  test('it should render per-app plan with available projects limit & future expiry date', async function (assert) {
    const clientPlan = this.server.create('partnerclient-plan', {
      limitedScans: false,
      expiryDate: dayjs(faker.date.future()).toISOString()
    });
    this.set('clientPlan', clientPlan)
    await render(hbs`<Partner::ClientInfoPlan @clientPlan={{this.clientPlan}}/>`);

    assert.dom('div[data-test-plan-type]').hasText(`t:perApp:()`);
    assert.dom('div[data-test-plan-type]').hasStyle({
      color: 'rgb(89, 149, 239)',
      'background-color': 'rgb(242, 247, 255)',
      'border-color': 'rgb(237, 244, 255)'
    })
    assert.dom('strong[data-test-plan-status-left]').hasText(`${this.clientPlan.projectsLimit} t:pluralApps:("itemCount":${this.clientPlan.projectsLimit})`)
    assert.dom('span[data-test-plan-expiry]').hasText(`t:expiresOn:() ${dayjs(this.clientPlan.expiryDate).format('DD MMM YYYY')}`)
    assert.dom('span[data-test-plan-expiry]').hasStyle({
      'font-size': '12.6px',
      color: 'rgb(155, 162, 173)'
    })
  });

  test('it should render per-app plan without projects count & expired', async function (assert) {

    const clientPlan = this.server.create('partnerclient-plan', {
      limitedScans: false,
      projectsLimit: 0,
      expiryDate: dayjs(faker.date.past()).toISOString()
    });
    this.set('clientPlan', clientPlan)
    await render(hbs`<Partner::ClientInfoPlan @clientPlan={{this.clientPlan}}/>`);

    assert.dom('div[data-test-plan-type]').hasText(`t:perApp:()`);
    assert.dom('div[data-test-plan-type]').hasStyle({
      color: 'rgb(89, 149, 239)',
      'background-color': 'rgb(242, 247, 255)',
      'border-color': 'rgb(237, 244, 255)'
    })
    assert.dom('strong[data-test-plan-status-left]').hasText(`${this.clientPlan.projectsLimit} t:pluralApps:("itemCount":${this.clientPlan.projectsLimit})`)
    assert.dom('span[data-test-plan-expiry]').hasText(`t:expiredOn:() ${dayjs(this.clientPlan.expiryDate).format('DD MMM YYYY')}`)
    assert.dom('span[data-test-plan-expiry]').hasStyle({
      'font-size': '12.6px',
      color: 'rgb(254, 77, 63)'
    })
  });

  test('it should render per-scan plan', async function (assert) {

    const clientPlan = this.server.create('partnerclient-plan', {
      limitedScans: true
    });
    this.set('clientPlan', clientPlan)
    await render(hbs`<Partner::ClientInfoPlan @clientPlan={{this.clientPlan}}/>`);

    assert.dom('div[data-test-plan-type]').hasText(`t:perScan:()`);
    assert.dom('div[data-test-plan-type]').hasStyle({
      "background-color": "rgb(240, 249, 242)",
      "border-color": "rgb(236, 248, 239)",
      "color": "rgb(87, 191, 114)"
    })
    assert.dom('strong[data-test-plan-status-left]').hasText(`${this.clientPlan.scansLeft} t:pluralScans:("itemCount":${this.clientPlan.scansLeft})`)
    assert.dom('div[data-test-plan-status]').hasText(`${this.clientPlan.scansLeft} t:pluralScans:("itemCount":${this.clientPlan.scansLeft}) t:remaining:()`)
  });

  test('it should not render payment plan, if error occurred', async function (assert) {

    this.set('clientPlan', null)
    await render(hbs`<Partner::ClientInfoPlan @clientPlan={{this.clientPlan}}/>`);
    assert.dom('div[data-test-payment-plan]').doesNotExist();
  });
});
