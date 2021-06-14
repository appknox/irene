import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import dayjs from 'dayjs';
import faker from 'faker';
import { underscore } from '@ember/string';
import styles from 'irene/components/partner/client-plan/styles';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module('Integration | Component | partner/client-plan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it should render per-app plan with available projects limit & future expiry date', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    const clientPlan = this.server.create('partner/partnerclient-plan', {
      projectsLimit: 99,
      expiryDate: dayjs(faker.date.future()).toISOString(),
      limitedScans: false,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema, req) => {
      return serializer(
        schema['partner/partnerclientPlans'].find(req.params.id)
      );
    });
    this.set('clientId', 1);
    await render(hbs`<Partner::ClientPlan @clientId={{this.clientId}}/>`);

    assert.dom('div[data-test-plan-type]').hasText(`t:perApp:()`);
    assert.dom('div[data-test-plan-type]').hasClass(styles['per-app']);
    assert
      .dom('strong[data-test-projects-left]')
      .hasText(
        `${clientPlan.projectsLimit} t:pluralApps:("itemCount":${clientPlan.projectsLimit})`
      );
    assert
      .dom('span[data-test-plan-expiry]')
      .hasText(
        `t:expiresOn:() ${dayjs(clientPlan.expiryDate).format('DD MMM YYYY')}`
      );
    assert
      .dom('span[data-test-plan-expiry]')
      .doesNotHaveClass(styles['expiry-date-expired']);
  });

  test('it should render per-app plan without projects count & expired', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    const clientPlan = this.server.create('partner/partnerclient-plan', {
      limitedScans: false,
      projectsLimit: 0,
      expiryDate: dayjs(faker.date.past()).toISOString(),
    });
    this.server.get('v2/partnerclients/:id/plan', (schema, req) => {
      return serializer(
        schema['partner/partnerclientPlans'].find(req.params.id)
      );
    });
    this.set('clientId', 1);
    await render(hbs`<Partner::ClientPlan @clientId={{this.clientId}}/>`);

    assert.dom('div[data-test-plan-type]').hasText(`t:perApp:()`);
    assert.dom('div[data-test-plan-type]').hasClass(styles['per-app']);
    assert
      .dom('strong[data-test-projects-left]')
      .hasText(
        `${clientPlan.projectsLimit} t:pluralApps:("itemCount":${clientPlan.projectsLimit})`
      );
    assert
      .dom('span[data-test-plan-expiry]')
      .hasText(
        `t:expiredOn:() ${dayjs(clientPlan.expiryDate).format('DD MMM YYYY')}`
      );
    assert
      .dom('span[data-test-plan-expiry]')
      .hasClass(styles['expiry-date-expired']);
  });

  test('it should render per-scan plan', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    const clientPlan = this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema, req) => {
      return serializer(
        schema['partner/partnerclientPlans'].find(req.params.id)
      );
    });
    this.set('clientId', 1);
    await render(hbs`<Partner::ClientPlan @clientId={{this.clientId}}/>`);

    assert.dom('div[data-test-plan-type]').hasText(`t:perScan:()`);
    assert.dom('div[data-test-plan-type]').hasClass(styles['per-scan']);
    assert
      .dom('strong[data-test-scans-left]')
      .hasText(
        `${clientPlan.scansLeft} t:pluralScans:("itemCount":${clientPlan.scansLeft})`
      );
    assert
      .dom('div[data-test-plan-status]')
      .hasText(
        `${clientPlan.scansLeft} t:pluralScans:("itemCount":${clientPlan.scansLeft}) t:remaining:()`
      );
  });

  test('it should not render client plan, if error occurred', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    this.server.get('v2/partnerclients/:id/plan', () => {
      return Response(500);
    });
    this.set('clientId', 1);
    await render(hbs`<Partner::ClientPlan @clientId={{this.clientId}}/>`);
    assert.dom('div[data-test-client-plan]').doesNotExist();
  });

  test('it should not render client plan, if view_plans privilege is not enabled', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: false,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::ClientPlan/>`);
    assert.dom('div[data-test-client-plan]').doesNotExist();
  });
});
