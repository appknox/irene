/* eslint-disable qunit/no-assert-equal, qunit/require-expect */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import faker from 'faker';
import styles from 'irene/components/partner/credit-transfer/credit-transfer-input/index.scss';

module(
  'Integration | Component | partner/credit-transfer/credit-transfer-input',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it renders', async function (assert) {
      this.set('partnerPlan', {
        scansLeft: 21,
      });
      this.set('clientName', faker.company.companyName());
      this.set('transferCount', 20);
      this.set('remainingCredits', 1);
      this.set('toggleMode', () => {});

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
        @partnerPlan={{this.partnerPlan}}
        @transferCount={{this.transferCount}}
        @remainingCredits={{this.remainingCredits}}
        @clientName={{this.clientName}}
        @toggleMode={{this.toggleMode}}/>`
      );

      assert
        .dom(`[data-test-transferable-credits]`)
        .hasText(
          `${this.partnerPlan.scansLeft} t:pluralScans:("itemCount":${this.partnerPlan.scansLeft})`
        );
      assert.dom(`[data-test-client-title]`).hasText(this.clientName);
      assert
        .dom(`[data-test-data-input-count]`)
        .hasValue(`${this.transferCount}`);
      assert
        .dom(`[data-test-credit-type]`)
        .hasText(`t:pluralScans:("itemCount":${this.transferCount})`);
      assert.dom(`[data-test-transfer-btn]`).hasText(`t:transferCredits:()`);
      assert.dom(`[data-test-transfer-btn]`).doesNotHaveAttribute(`disabled`);
    });

    test('it renders empty client name', async function (assert) {
      this.set('clientName', '');

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
        @clientName={{this.clientName}} />`
      );

      assert.dom(`[data-test-client-title]`).hasClass(styles['empty-title']);
      assert.dom(`[data-test-client-title]`).hasText(`t:noName:()`);
    });

    test('it renders with input box', async function (assert) {
      this.set('partnerPlan', {
        scansLeft: 21,
      });
      this.set('transferCount', 20);

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
        @partnerPlan={{this.partnerPlan}}
        @transferCount={{this.transferCount}} />`
      );

      assert
        .dom(`[data-test-data-input-count]`)
        .hasValue(`${this.transferCount}`);
      assert.equal(
        this.element.querySelector(`[data-test-data-input-count]`).max,
        this.partnerPlan.scansLeft,
        'Input has max limit equals to partner scans left'
      );

      assert
        .dom(`[data-test-credit-type]`)
        .hasText(`t:pluralScans:("itemCount":${this.transferCount})`);
    });

    test('it render transfer btn with active state', async function (assert) {
      this.set('toggleMode', () => {});
      this.set('transferCount', 21);
      this.set('partnerPlan', { scansLeft: 22 });
      this.set('remainingCredits', 1);

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
        @toggleMode={{this.toggleMode}}
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        @remainingCredits={{this.remainingCredits}}
        />`
      );

      assert.dom(`[data-test-transfer-btn]`).doesNotHaveAttribute('disabled');
      assert.dom(`[data-test-transfer-btn]`).hasText(`t:transferCredits:()`);
    });

    test('it should not render transfer btn', async function (assert) {
      this.set('transferCount', 21);
      this.set('partnerPlan', { scansLeft: 22 });

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        />`
      );

      assert.dom(`[data-test-transfer-btn]`).doesNotExist();
    });

    test('it should render transfer btn with disabled state', async function (assert) {
      this.set('toggleMode', () => {});
      this.set('transferCount', 0);
      this.set('partnerPlan', { scansLeft: 22 });

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
          @toggleMode={{this.toggleMode}}
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        />`
      );

      assert.dom(`[data-test-transfer-btn]`).hasAttribute('disabled');
    });

    test('transfer btn state should be changed by transfer count value', async function (assert) {
      this.set('toggleMode', () => {});
      this.set('transferCount', 1);
      this.set('partnerPlan', { scansLeft: 22 });
      this.set('remainingCredits', 21);

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
          @toggleMode={{this.toggleMode}}
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        @remainingCredits={{this.remainingCredits}}
        />`
      );

      assert
        .dom(`[data-test-transfer-btn]`)
        .doesNotHaveAttribute(
          'disabled',
          `Should be in active state becuase of default value`
        );
      const inputBtn = this.element.querySelector(
        `[data-test-data-input-count]`
      );

      await fillIn(inputBtn, 0);

      assert
        .dom(`[data-test-transfer-btn]`)
        .hasAttribute(
          'disabled',
          '',
          'Should be disabled, since the vlaue is 0'
        );

      await fillIn(inputBtn, 1.5);

      assert
        .dom(`[data-test-transfer-btn]`)
        .hasAttribute(
          'disabled',
          '',
          'Should be in disabled state since the value is not correct'
        );

      await fillIn(inputBtn, 10);

      assert
        .dom(`[data-test-transfer-btn]`)
        .doesNotHaveAttribute(
          'disabled',
          'Should be in active state, since the value is correct'
        );

      await fillIn(inputBtn, '');

      assert
        .dom(`[data-test-transfer-btn]`)
        .hasAttribute(
          'disabled',
          '',
          'Should be in disabled state, since the value is not available'
        );
    });

    test('it should handle transfer credits btn action', async function (assert) {
      this.set('toggleMode', () => {
        assert.ok(true, 'Tranfer Credits btn has clicked');
      });
      this.set('transferCount', 1);
      this.set('remainingCredits', 9);

      await render(
        hbs`<Partner::CreditTransfer::CreditTransferInput
          @toggleMode={{this.toggleMode}}
        @transferCount={{this.transferCount}}
        @remainingCredits={{this.remainingCredits}}
        />`
      );

      await click(this.element.querySelector(`[data-test-transfer-btn]`));
    });
  }
);
