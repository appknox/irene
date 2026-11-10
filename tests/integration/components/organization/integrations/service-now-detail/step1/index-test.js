import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';

import serviceNowValidation from 'irene/components/organization/integrations/service-now/validator';

const selectors = {
  instanceURLInput:
    '[data-test-orgIntegrations-serviceNowDetail-instanceURLInput]',
  usernameInput: '[data-test-orgIntegrations-serviceNowDetail-usernameInput]',
  passwordInput: '[data-test-orgIntegrations-serviceNowDetail-passwordInput]',
  autoPushToggle: '[data-test-orgIntegrations-serviceNowDetail-autoPushToggle]',
};

module(
  'Integration | Component | organization/integrations/service-now-detail/step1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('it renders credential fields and auto push toggle', async function (assert) {
      const changeset = Changeset(
        {},
        lookupValidator(serviceNowValidation),
        serviceNowValidation
      );

      this.changeset = changeset;
      this.autoPush = false;

      this.onToggleAutoPush = () => {};

      await render(hbs`
        <Organization::Integrations::ServiceNowDetail::Step1
          @changeset={{this.changeset}}
          @autoPush={{this.autoPush}}
          @onToggleAutoPush={{this.onToggleAutoPush}}
        />
      `);

      assert.dom(selectors.instanceURLInput).exists();

      assert.dom(selectors.usernameInput).exists();

      assert.dom(selectors.passwordInput).exists();

      assert.dom(selectors.autoPushToggle).exists();

      assert.dom().containsText(t('serviceNow.autoPush'));

      assert.dom().containsText(t('serviceNow.autoPushDesc'));
    });

    test('it calls onToggleAutoPush when toggle is clicked', async function (assert) {
      assert.expect(1);

      const changeset = Changeset(
        {},
        lookupValidator(serviceNowValidation),
        serviceNowValidation
      );

      this.changeset = changeset;
      this.autoPush = false;
      this.onToggleAutoPush = () => assert.ok(true, 'toggle callback called');

      await render(hbs`
        <Organization::Integrations::ServiceNowDetail::Step1
          @changeset={{this.changeset}}
          @autoPush={{this.autoPush}}
          @onToggleAutoPush={{this.onToggleAutoPush}}
        />
      `);

      await click(`${selectors.autoPushToggle} [data-test-toggle-input]`);
    });
  }
);
