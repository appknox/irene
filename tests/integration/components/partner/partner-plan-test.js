import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { underscore } from '@ember/string';
import styles from 'irene/components/partner/partner-plan/index.scss';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module('Integration | Component | partner/partner-plan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it should not render when partner view_plans access privilege is not given', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: false,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom('[data-test-partner-plan]').doesNotExist();
  });

  test('it should render per-scan details', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    const partnerPlan = this.server.create('partner/plan', {
      limitedScans: true,
    });
    this.server.get('v2/partners/:id/plan', (schema, request) => {
      return serializer(schema['partner/plans'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom(`[data-test-plan-label]`).hasText('t:yourPlan:()');
    assert.dom('[data-test-plan-type]').hasClass(styles['per-scan']);
    assert.dom(`[data-test-plan-type]`).hasText(`t:perScan:()`);
    assert.dom(`[data-test-credits-left]`).hasText(`${partnerPlan.scansLeft}`);
    assert
      .dom(`[data-test-credits-type]`)
      .hasText(`t:pluralScans:("itemCount":${partnerPlan.scansLeft})`);
  });

  test('it should render per-app details', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    const partnerPlan = this.server.create('partner/plan', {
      limitedScans: false,
    });
    this.server.get('v2/partners/:id/plan', (schema, request) => {
      return serializer(schema['partner/plans'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom(`[data-test-plan-label]`).hasText('t:yourPlan:()');
    assert.dom('[data-test-plan-type]').hasClass(styles['per-app']);
    assert.dom(`[data-test-plan-type]`).hasText(`t:perApp:()`);
    assert
      .dom(`[data-test-credits-left]`)
      .hasText(`${partnerPlan.projectsLimit}`);
    assert
      .dom(`[data-test-credits-type]`)
      .hasText(`t:pluralApps:("itemCount":${partnerPlan.projectsLimit})`);
  });

  test('it should render credit transfer warning for per-app plan', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: true,
        transfer_credits: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    this.server.create('partner/plan', {
      limitedScans: false,
    });
    this.server.get('v2/partners/:id/plan', (schema, request) => {
      return serializer(schema['partner/plans'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom('[data-test-plan-type]').hasText(`t:perApp:()`);
    assert.dom('[data-test-warning-credit-transfer-unavailable]').exists();
    assert.dom('[data-test-warning-zero-scan-credits]').doesNotExist();
  });

  test('it should render zero credit transfer warning for per-scan plan when scans left is 0', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: true,
        transfer_credits: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    this.server.create('partner/plan', {
      limitedScans: true,
      scansLeft: 0,
    });
    this.server.get('v2/partners/:id/plan', (schema, request) => {
      return serializer(schema['partner/plans'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom('[data-test-plan-type]').hasText(`t:perScan:()`);
    assert.dom('[data-test-warning-zero-scan-credits]').exists();
    assert
      .dom('[data-test-warning-credit-transfer-unavailable]')
      .doesNotExist();
  });

  test('it should not render credit transfer warnings for per-scan with some credits left', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: true,
        transfer_credits: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    this.server.create('partner/plan', {
      limitedScans: true,
      scansLeft: 1,
    });
    this.server.get('v2/partners/:id/plan', (schema, request) => {
      return serializer(schema['partner/plans'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom('[data-test-plan-type]').hasText(`t:perScan:()`);
    assert.dom('[data-test-warning-zero-scan-credits]').doesNotExist();
    assert
      .dom('[data-test-warning-credit-transfer-unavailable]')
      .doesNotExist();
  });

  test('it should not render credit transfer warnings when transfer_credits privilege is not given', async function (assert) {
    this.server.create('partner/partner', {
      access: {
        view_plans: true,
      },
    });
    this.server.get('v2/partners/:id', (schema, request) => {
      return serializer(schema['partner/partners'].find(request.params.id));
    });

    this.server.create('partner/plan', {
      limitedScans: true,
      scansLeft: 0,
    });
    this.server.get('v2/partners/:id/plan', (schema, request) => {
      return serializer(schema['partner/plans'].find(request.params.id));
    });

    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom('[data-test-plan-type]').hasText(`t:perScan:()`);
    assert.dom('[data-test-warning-zero-scan-credits]').doesNotExist();
    assert
      .dom('[data-test-warning-credit-transfer-unavailable]')
      .doesNotExist();
  });

  test('it should not render if api error occurred', async function (assert) {
    this.server.get('v2/partners/:id/plan', () => {
      return Response(500);
    });
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom(`[data-test-partner-plan] div`).doesNotExist();
  });
});
