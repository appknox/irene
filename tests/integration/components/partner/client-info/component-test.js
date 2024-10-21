import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { underscore } from '@ember/string';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from 'irene/components/partner/client-info/styles';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module('Integration | Component | partner/client-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 1);
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
    assert.dom('div[data-test-title]').hasText(t('noName'));
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
    assert.dom('div[data-test-last-upload]').hasText(t('noUploads'));
  });

  test('it should show last uploded date in relative format', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    dayjs.extend(relativeTime);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload-label]').hasText(t('lastUpload'));
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

    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-payment-plan-row]').exists();
    assert.dom('div[data-test-payment-plan-label]').hasText(t('paymentPlan'));
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

  test('it should show client created on date correctly', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);
    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);

    assert
      .dom(`[data-test-created-on]`)
      .hasText(dayjs(this.client.createdOn).format('DD MMM YYYY'));
  });

  test('it should render transfer credits button if transfer_credits & view_plans privileges are enabled', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        transfer_credits: true,
        view_plans: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    const client = this.server.create('partner/partnerclient');
    this.set('client', client);

    await this.owner.lookup('service:partner').load();

    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);

    assert.dom('[data-test-credit-transfer]').exists();
  });

  test('it should not render transfer credits button if transfer_credits or view_plans privileges is disabled', async function (assert) {
    const client = this.server.create('partner/partnerclient');
    this.set('client', client);

    this.server.create('partner/partner', {
      access: {
        transfer_credits: false,
        view_plans: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();

    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);

    assert.dom('[data-test-credit-transfer]').doesNotExist();

    this.server.create('partner/partner', {
      access: {
        transfer_credits: true,
        view_plans: false,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();

    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);

    assert.dom('[data-test-credit-transfer]').doesNotExist();

    this.server.create('partner/partner', {
      access: {
        transfer_credits: false,
        view_plans: false,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();

    await render(hbs`<Partner::ClientInfo @client={{this.client}}/>`);

    assert.dom('[data-test-credit-transfer]').doesNotExist();
  });

  test('it should render detail link button if list_projects privilege is enabled', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        list_projects: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    const client = this.server.create('partner/partnerclient');
    this.set('client', client);

    await this.owner.lookup('service:partner').load();

    await render(
      hbs`<Partner::ClientInfo @client={{this.client}} @showDetailLink={{true}}/>`
    );

    assert.dom('[data-test-detail-page-link]').exists();
  });

  test('it should not render detail link button if list_projects privilege is disabled', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        list_projects: false,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    const client = this.server.create('partner/partnerclient');
    this.set('client', client);

    await this.owner.lookup('service:partner').load();

    await render(
      hbs`<Partner::ClientInfo @client={{this.client}} @showDetailLink={{true}}/>`
    );

    assert.dom('[data-test-detail-page-link]').doesNotExist();
  });

  test('it should not render detail link button if showDetailLink is false even if list_projects privilege is enabled', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        list_projects: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    const client = this.server.create('partner/partnerclient');
    this.set('client', client);

    await this.owner.lookup('service:partner').load();

    await render(
      hbs`<Partner::ClientInfo @client={{this.client}} @showDetailLink={{false}}/>`
    );

    assert.dom('[data-test-detail-page-link]').doesNotExist();
  });
});
