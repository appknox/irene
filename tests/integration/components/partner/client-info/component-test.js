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
import relativeTime from 'dayjs/plugin/relativeTime';

module('Integration | Component | partner/client-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it should render client thumbnail', async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-test-thumbnail]').exists();
  });

  test("it should render client name", async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-title]').hasText(this.client.name);
  });

  test("it should handle empty client name", async function (assert) {
    const client = this.server.create('partnerclient', {
      name: null
    });
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-title]').hasText(`t:noName:()`);
    assert.dom('div[data-test-title]').hasStyle({
      "color": "rgb(66, 70, 81)",
      "font-size": "14px",
      "font-style": "italic"
    });
  });

  //pending client name visibility ellipsis

  test('it should no uploades done by the client', async function (assert) {
    const client = this.server.create('partnerclient');
    client.lastUploadedOn = null;
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload]').hasText('t:noUploads:()')
  });

  test('it should show last uploded date in relative format', async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    dayjs.extend(relativeTime)
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload-label]').hasText(`t:lastUpload:()`);
    assert.dom('div[data-test-last-upload]').hasText(dayjs(this.client.lastUploadedOn).fromNow())
  });

  test("it should render client owner list", async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-client-owner-emails]').exists();
  });

  test('it should render payment plan section, if view_plans enabled', async function (assert) {
    const client = this.server.create('partnerclient');
    await this.owner.lookup('service:partner').load();
    this.server.get('v2/partnerclients/:id/plan', (schema, req) => {
      return {
        id: req.params.id,
        data: {}
      }
    })

    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').exists();
    assert.dom('div[data-test-payment-plan-label]').hasText(`t:paymentPlan:()`);
    assert.dom('div[data-test-payment-plan]').exists()
  })

  test('it should not render payment plan, if error occurred during plan details fetch', async function (assert) {
    await this.owner.lookup('service:partner').load();
    this.server.get('v2/partnerclients/:id/plan', () => {
      return Response(500)
    })
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-label]').hasText(`t:paymentPlan:()`);
    assert.dom('div[data-test-payment-plan]').doesNotExist();
  })

  test('it should not render payment plan section, if view_plans is not enabled', async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').doesNotExist();
  })
});
