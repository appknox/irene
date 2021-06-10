import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import faker from 'faker';
import styles from 'irene/components/partner/credit-transfer-input/index.scss';

module(
  'Integration | Component | partner/credit-transfer-input',
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
        hbs`<Partner::CreditTransferInput
        @partnerPlan={{this.partnerPlan}}
        @transferCount={{this.transferCount}}
        @remainingCredits={{this.remainingCredits}}
        @clientName={{this.clientName}}
        @toggleMode={{this.toggleMode}}/>`
      );

      assert
        .dom(`[data-test='transferable-credits']`)
        .hasText(
          `${this.partnerPlan.scansLeft} t:pluralScans:("itemCount":${this.partnerPlan.scansLeft})`
        );
      assert.dom(`[data-test='client-title']`).hasText(this.clientName);
      assert
        .dom(`[data-test='data-input-count']`)
        .hasValue(`${this.transferCount}`);
      assert
        .dom(`[data-test='credit-type']`)
        .hasText(`t:pluralScans:("itemCount":${this.transferCount})`);
      assert.dom(`[data-test='transfer-btn']`).hasText(`t:transferCredits:()`);
      assert.dom(`[data-test='transfer-btn']`).doesNotHaveAttribute(`disabled`);
    });

    test('it renders empty client name', async function (assert) {
      this.set('clientName', '');

      await render(
        hbs`<Partner::CreditTransferInput
        @clientName={{this.clientName}} />`
      );

      assert.dom(`[data-test='client-title']`).hasClass(styles['empty-title']);
      assert.dom(`[data-test='client-title']`).hasText(`t:noName:()`);
    });

    test('it renders with input box', async function (assert) {
      this.set('partnerPlan', {
        scansLeft: 21,
      });
      this.set('transferCount', 20);

      await render(
        hbs`<Partner::CreditTransferInput
        @partnerPlan={{this.partnerPlan}}
        @transferCount={{this.transferCount}} />`
      );

      assert
        .dom(`[data-test='data-input-count']`)
        .hasValue(`${this.transferCount}`);
      assert.equal(
        this.element.querySelector(`[data-test='data-input-count']`).max,
        this.partnerPlan.scansLeft,
        'Input has max limit equals to partner scans left'
      );

      assert
        .dom(`[data-test='credit-type']`)
        .hasText(`t:pluralScans:("itemCount":${this.transferCount})`);
    });

    test('it render transfer btn with active state', async function (assert) {
      this.set('toggleMode', () => {});
      this.set('transferCount', 21);
      this.set('partnerPlan', { scansLeft: 22 });
      this.set('remainingCredits', 1);

      await render(
        hbs`<Partner::CreditTransferInput
        @toggleMode={{this.toggleMode}}
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        @remainingCredits={{this.remainingCredits}}
        />`
      );

      assert.dom(`[data-test='transfer-btn']`).doesNotHaveAttribute('disabled');
      assert.dom(`[data-test='transfer-btn']`).hasText(`t:transferCredits:()`);
    });

    test('it should not render transfer btn', async function (assert) {
      this.set('transferCount', 21);
      this.set('partnerPlan', { scansLeft: 22 });

      await render(
        hbs`<Partner::CreditTransferInput
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        />`
      );

      assert.dom(`[data-test='transfer-btn']`).doesNotExist();
    });

    test('it should render transfer btn with disabled state', async function (assert) {
      this.set('toggleMode', () => {});
      this.set('transferCount', 0);
      this.set('partnerPlan', { scansLeft: 22 });

      await render(
        hbs`<Partner::CreditTransferInput
          @toggleMode={{this.toggleMode}}
        @transferCount={{this.transferCount}}
        @partnerPlan={{this.partnerPlan}}
        />`
      );

      assert.dom(`[data-test='transfer-btn']`).hasAttribute('disabled');
    });
  }
);
