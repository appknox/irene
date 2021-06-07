import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from 'irene/components/partner/client-info/styles';

module('Integration | Component | partner/client-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it should render client thumbnail', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-test-thumbnail]').exists();
  });

  test('it should render client name', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-title]').hasText(this.client.name);
  });

  test('it should handle empty client name', async function (assert) {
    const client = this.server.create('partner/partnerclient', {
      name: null,
    });
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-title]').hasText(`t:noName:()`);
    assert.dom('div[data-test-title]').hasClass(styles['empty-title']);
  });

  test('it should truncate client name if it has 200 chars', async function (assert) {
    const client = this.server.create('partner/partnerclient', {
      name: 'g'.repeat(200),
    });
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    const titleEle = this.element.querySelector('div[data-test-title]');
    assert.ok(titleEle.offsetWidth < titleEle.scrollWidth);
  });

  test('it should truncate client name when the container has set limited width', async function (assert) {
    const client = this.server.create('partner/partnerclient', {
      name: 'g'.repeat(200),
    });
    this.set('client', client);
    await render(
      hbs`<div style="width:100px"><Partner::ClientInfo @client={{this.client}}/></div>`
    );
    const titleEle = this.element.querySelector('div[data-test-title]');
    assert.ok(titleEle.offsetWidth < titleEle.scrollWidth);
  });

  test('it should not truncate client name if it has 10 chars', async function (assert) {
    const client = this.server.create('partner/partnerclient', {
      name: 'g'.repeat(10),
    });
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    const titleEle = this.element.querySelector('div[data-test-title]');
    assert.notOk(titleEle.offsetWidth < titleEle.scrollWidth);
  });

  test('it should no uploades done by the client', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    client.lastUploadedOn = null;
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload]').hasText('t:noUploads:()');
  });

  test('it should show last uploded date in relative format', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    dayjs.extend(relativeTime);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload-label]').hasText(`t:lastUpload:()`);
    assert
      .dom('div[data-test-last-upload]')
      .hasText(dayjs(this.client.lastUploadedOn).fromNow());
  });

  test('it should render client owner list', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-client-owner-emails]').exists();
  });

  test('it should render payment plan row, if view_plans enabled', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    this.server.get('v2/partnerclients/:id/plan', (schema, req) => {
      return {
        id: req.params.id,
        data: {},
      };
    });

    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').exists();
    assert.dom('div[data-test-payment-plan-label]').hasText(`t:paymentPlan:()`);
    assert.dom('div[data-test-payment-plan]').exists();
  });

  test('it should not render payment plan row, if view_plans disabled', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: false,
        },
      };
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').doesNotExist();
  });

  test('it should not render payment plan row, if view_plans not available', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {},
      };
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').doesNotExist();
  });

  test('it should not render payment plan section, if view_plans is not enabled', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').doesNotExist();
  });
});
