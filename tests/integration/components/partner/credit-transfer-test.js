import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
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
    assert.dom('[data-test="credit-transfer"]').doesNotExist();
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
    assert.dom('[data-test="credit-transfer"]').doesNotExist();
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
    assert.dom('[data-test="credit-transfer"]').doesNotExist();
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
    assert.dom('[data-test="credit-transfer"]').doesNotExist();
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
    assert.dom('[data-test="credit-transfer"]').exists();
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
    assert.dom('[data-test="credit-transfer"]').exists();
    assert.dom('[data-test="plus-btn"]').doesNotExist();
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
    assert.dom('[data-test="credit-transfer"]').exists();
    assert.dom('[data-test="plus-btn"]').exists();
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
    assert.dom('[data-test="plus-btn"]').exists();
    assert.dom('[data-test="plus-btn"]').hasClass(styles['disabled-btn']);
    assert
      .dom(`#client-${this.client.id}-tooltip`)
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
    assert.dom('[data-test="plus-btn"]').exists();
    assert.dom('[data-test="plus-btn"]').hasClass(styles['disabled-btn']);
    assert
      .dom(`#client-${this.client.id}-tooltip`)
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
    assert.dom('[data-test="plus-btn"]').exists();
    assert
      .dom('[data-test="plus-btn"]')
      .doesNotHaveClass(styles['disabled-btn']);
    assert
      .dom(`#client-${this.client.id}-tooltip`)
      .hasText(`t:transferCredits:()`);
  });

  test('it open modal whien clicking at plus btn and renders input screen', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    const partnerPlan = {
      limitedScans: true,
      scansLeft: 10,
    };

    this.server.create('partner/plan', partnerPlan);
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

    await click(this.element.querySelector('[data-test="plus-btn"]'));

    assert.dom('[data-test="credit-transfer-modal"]').exists();
    assert.dom(`[data-test='credit-transfer-input']`).exists();
    assert.dom(`[data-test='credit-transfer-ack']`).doesNotExist();
    assert
      .dom(`[data-test='transferable-credits']`)
      .hasText(
        `${partnerPlan.scansLeft} t:pluralScans:("itemCount":${partnerPlan.scansLeft})`
      );
    assert.dom(`[data-test='client-title']`).hasText(this.client.name);
    const defaultInputValue = 1;
    assert
      .dom(`[data-test='data-input-count']`)
      .hasValue(`${defaultInputValue}`);
    assert
      .dom(`[data-test='credit-type']`)
      .hasText(`t:pluralScans:("itemCount":${defaultInputValue})`);
    assert.dom(`[data-test='transfer-btn']`).hasText(`t:transferCredits:()`);
    assert.dom(`[data-test='transfer-btn']`).doesNotHaveAttribute(`disabled`);
  });

  test('it open ack screen in modal whien clicking at transfer credits button', async function (assert) {
    this.server.get('v2/partners/:id', (_, req) => {
      return {
        id: req.params.id,
        access: {
          view_plans: true,
          transfer_credits: true,
        },
      };
    });

    const partnerPlan = {
      limitedScans: true,
      scansLeft: 10,
    };

    this.server.create('partner/plan', partnerPlan);
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });

    const clientPlan = {
      limitedScans: true,
      scansLeft: 99,
    };

    this.server.create('partner/partnerclient-plan', clientPlan);
    this.server.get('v2/partnerclients/:id/plan', (schema) => {
      return serializer(schema['partner/partnerclientPlans'].find(1));
    });
    await this.owner.lookup('service:partner').load();

    this.set('client', this.server.create('partner/partnerclient'));

    await render(hbs`<Partner::CreditTransfer @client={{this.client}}/>`);

    // click plus btn
    await click(this.element.querySelector('[data-test="plus-btn"]'));

    //click transfer credits btn, assumed there is default credits
    await click(this.element.querySelector(`[data-test='transfer-btn']`));

    assert.dom(`[data-test='credit-transfer-ack']`).exists();
    assert.dom(`[data-test='credit-transfer-input']`).doesNotExist();
    assert.equal(
      this.element.querySelectorAll(
        `[data-test='partner-credits'] [data-test='row']`
      ).length,
      2,
      'Partner credits has two rows'
    );

    assert
      .dom(`[data-test='partner-current-credits-key']`)
      .hasText(`t:currentCredits:():`);
    assert
      .dom(`[data-test='partner-current-credits-value']`)
      .hasText(
        `${partnerPlan.scansLeft} t:pluralScans:("itemCount":${partnerPlan.scansLeft})`
      );

    const defaultInputValue = 1;
    assert
      .dom(`[data-test='partner-remaining-credits-key']`)
      .hasText(`t:remainingCredits:():`);
    assert
      .dom(`[data-test='partner-remaining-credits-value']`)
      .hasText(
        `${
          partnerPlan.scansLeft - defaultInputValue
        } t:pluralScans:("itemCount":${
          partnerPlan.scansLeft - defaultInputValue
        })`
      );

    // Client credits sec
    assert.equal(
      this.element.querySelectorAll(
        `[data-test='client-credits'] [data-test='row']`
      ).length,
      3,
      'Client credits has three rows'
    );

    assert.dom(`[data-test='client-key']`).hasText(`t:client:():`);
    assert.dom(`[data-test='client-value']`).hasText(this.client.name);
    assert
      .dom(`[data-test='client-current-credits-key']`)
      .hasText(`t:currentCredits:():`);
    assert
      .dom(`[data-test='client-current-credits-value']`)
      .hasText(
        `${clientPlan.scansLeft} t:pluralScans:("itemCount":${clientPlan.scansLeft})`
      );

    assert.dom(`[data-test='new-credits-key']`).hasText(`t:newCredits:():`);
    assert
      .dom(`[data-test='new-credits-value']`)
      .hasText(
        `${defaultInputValue} t:pluralScans:("itemCount":${defaultInputValue})`
      );

    assert.equal(
      this.element.querySelectorAll(`[data-test='action-btns'] button`).length,
      2
    );
    assert.dom(`[data-test='confirm-btn']`).hasText(`t:confirmTransfer:()`);
    assert.dom(`[data-test='back-btn']`).hasText(`t:back:()`);
  });
});
