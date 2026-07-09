import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

const selectors = {
  autoPushDisplay:
    '[data-test-orgIntegrations-serviceNowDetail-autoPushDisplay]',
};

module(
  'Integration | Component | organization/integrations/service-now-detail/integrated',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('it renders connected account details', async function (assert) {
      await render(hbs`
        <Organization::Integrations::ServiceNowDetail::Integrated
          @instanceURL='https://example.service-now.com'
          @username='admin'
          @tableName='sn_vul_app_vulnerable_item'
          @autoPush={{false}}
        />
      `);

      assert.dom().containsText('https://example.service-now.com');

      assert.dom().containsText('admin');

      assert.dom().containsText('sn_vul_app_vulnerable_item');

      assert.dom().containsText(t('serviceNow.connectedAccount'));
    });

    test('it shows auto push toggle in disabled state', async function (assert) {
      await render(hbs`
        <Organization::Integrations::ServiceNowDetail::Integrated
          @instanceURL='https://example.service-now.com'
          @username='admin'
          @tableName='sn_vul_app_vulnerable_item'
          @autoPush={{true}}
        />
      `);

      assert.dom(selectors.autoPushDisplay).exists();

      assert
        .dom(`${selectors.autoPushDisplay} [data-test-toggle-input]`)
        .isDisabled();
    });
  }
);
