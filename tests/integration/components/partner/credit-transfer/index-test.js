import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { click, find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { underscore } from '@ember/string';
import styles from 'irene/components/partner/credit-transfer/index.scss';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module('Integration | Component | partner/credit-transfer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it render nothing when partner view_plans: false, transfer_credits: true', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: false,
          transfer_credits: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').doesNotExist();
  });

  test('it render nothing when partner view_plans: true, transfer_credits: false', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: false,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').doesNotExist();
  });

  test('it render nothing when partner view_plans: false, transfer_credits: false', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: false,
          transfer_credits: false,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').doesNotExist();
  });

  test('it render nothing when partner access privilege is not set', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {},
      };
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').doesNotExist();
  });

  test('it render DOM only when partner partner view_plans: true, transfer_credits: true', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').exists();
  });

  test('it should not render plus btn, if partner plan is per app', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', {
      limitedScans: false,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').exists();
    assert.dom('[data-test-plus-btn]').doesNotExist();
  });

  test('it render plus btn, if partner plan is per scan', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', {
      limitedScans: true,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });
    await this.owner.lookup('service:partner').load();
    await render(hbs`<Partner::CreditTransfer />`);
    assert.dom('[data-test-credit-transfer]').exists();
    assert.dom('[data-test-plus-btn]').exists();
  });

  test('it render plus btn with disabled state, if client plan is per app', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', {
      limitedScans: true,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: false,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    assert.dom('[data-test-plus-btn]').exists();
    assert.dom('[data-test-plus-btn]').hasClass(styles['disabled-btn']);

    const creditTransferTooltip = find(
      '[data-test-credit-transfer] [data-test-ak-tooltip-root]'
    );

    await triggerEvent(creditTransferTooltip, 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-popover]')
      .hasText(`t:perAppCreditTransferStatus:()`);
  });

  test('it render plus btn with disabled state, if partner has 0 scansLeft', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', {
      limitedScans: true,
      scansLeft: 0,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);
    assert.dom('[data-test-plus-btn]').exists();
    assert.dom('[data-test-plus-btn]').hasClass(styles['disabled-btn']);

    const creditTransferTooltip = find(
      '[data-test-credit-transfer] [data-test-ak-tooltip-root]'
    );

    await triggerEvent(creditTransferTooltip, 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-popover]')
      .hasText(`t:0sharableCredits:()`);
  });

  test('it render plus btn with clickable state', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', {
      limitedScans: true,
      scansLeft: 10,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);
    assert.dom('[data-test-plus-btn]').exists();
    assert.dom('[data-test-plus-btn]').doesNotHaveClass(styles['disabled-btn']);
    assert
      .dom(`#client-${this.client.id}-tooltip`)
      .doesNotExist('Tooltip not required for clickable state');
  });

  test('it should open modal when clicking at plus btn and renders input component', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', { limitedScans: true, scansLeft: 10 });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    await click(this.element.querySelector('[data-test-plus-btn]'));

    assert.dom('[data-test-credit-transfer-modal]').exists('Modal shown');
    assert
      .dom(`[data-test-credit-transfer-input]`)
      .exists('Input screen rendered by default');
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .doesNotExist(`Confirm screen isn't visible`);
  });

  test('it should open confirm screen after clicking at transfer credits btn', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', { limitedScans: true, scansLeft: 10 });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    await click(this.element.querySelector('[data-test-plus-btn]'));

    assert.dom('[data-test-credit-transfer-modal]').exists('Modal opened');
    assert
      .dom(`[data-test-credit-transfer-input]`)
      .exists('Input screen shown by default');
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .doesNotExist(`Confirm screen is not visible by default`);
    await click(this.element.querySelector(`[data-test-transfer-btn]`));
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .exists(`Confirm screen visible after hit tranfer credits btn`);
  });

  test('it should show input screen after clicking back btn', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', { limitedScans: true, scansLeft: 10 });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    await click(this.element.querySelector('[data-test-plus-btn]'));

    assert.dom('[data-test-credit-transfer-modal]').exists('Modal opened');
    assert
      .dom(`[data-test-credit-transfer-input]`)
      .exists('Input screen shown by default');
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .doesNotExist(`Confirm screen isn't visible by default`);
    await click(this.element.querySelector(`[data-test-transfer-btn]`));
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .exists('Confirm screen shown after hit transfer credits btn');

    await click(this.element.querySelector(`[data-test-back-btn]`));

    assert
      .dom(`[data-test-credit-transfer-input]`)
      .exists('Input screen shown after click at back btn from confirm screen');
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .doesNotExist(`Confirm screen isn't rendering`);
  });

  test('it should close modal after hit confirm transfer btn', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', { limitedScans: true, scansLeft: 10 });

    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });

    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });

    this.server.post('v2/partnerclients/:id/transfer_scans', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });

    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    await click(this.element.querySelector('[data-test-plus-btn]'));

    assert.dom('[data-test-credit-transfer-modal]').exists('Modal opened');

    assert
      .dom(`[data-test-credit-transfer-input]`)
      .exists('Input screen shown by default');

    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .doesNotExist(`Confirm screen isn't visible by default`);

    await click(this.element.querySelector(`[data-test-transfer-btn]`));

    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .exists('Confirm screen shown after hit transfer credits btn');

    await click(this.element.querySelector(`[data-test-confirm-btn]`));

    assert
      .dom('[data-test-credit-transfer-modal]')
      .doesNotExist('Modal closed');
  });

  test('it should not close modal after hit confirm transfer btn, if error occured', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.create('partner/plan', { limitedScans: true, scansLeft: 10 });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    this.server.create('partner/partnerclient-plan', {
      limitedScans: true,
    });
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    this.server.post('v2/partnerclients/:id/transfer_scans', () => {
      return Response(500);
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    await click(this.element.querySelector('[data-test-plus-btn]'));

    assert.dom('[data-test-credit-transfer-modal]').exists('Modal opened');
    assert
      .dom(`[data-test-credit-transfer-input]`)
      .exists('Input screen shown by default');
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .doesNotExist(`Confirm screen isn't visible by default`);
    await click(this.element.querySelector(`[data-test-transfer-btn]`));
    assert
      .dom(`[data-test-credit-transfer-confirm]`)
      .exists('Confirm screen shown after hit transfer credits btn');

    await click(this.element.querySelector(`[data-test-confirm-btn]`));

    assert
      .dom('[data-test-credit-transfer-modal]')
      .exists('Modal still in open state');
  });

  test('it render nothing when error occured', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    this.server.get('v2/partners/:id/plan', () => {
      return Response(500);
    });

    this.server.get('v2/partnerclients/:id/plan', () => {
      return Response(500);
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    assert.dom(`[data-test-credit-transfer]`).exists();
    assert.dom(`[data-test-plus-btn]`).doesNotExist();
  });
});
