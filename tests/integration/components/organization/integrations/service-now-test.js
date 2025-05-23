import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support';

import styles from 'irene/components/ak-select/index.scss';
import ENUMS from 'irene/enums';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

const assertNonIntegratedUI = async (assert) => {
  assert
    .dom('[data-test-org-integration-card-description="ServiceNow"]')
    .hasText(t('serviceNowIntegrationDesc'));

  assert
    .dom('[data-test-org-integration-card-connectBtn]')
    .isNotDisabled()
    .hasText(t('connect'));

  await click('[data-test-org-integration-card-connectBtn]');

  assert
    .dom('[data-test-orgIntegrations-serviceNow-instanceURLInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-serviceNow-usernameInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-serviceNow-passwordInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-serviceNow-selectServiceNowTableTitle]')
    .hasText(t('serviceNow.serviceNowTable'));

  assert
    .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
    .isNotDisabled()
    .hasText(t('integrate'));

  // Integrated UI should not be visible
  assert.dom('[data-test-orgIntegrations-integratedUI-logo]').doesNotExist();

  assert.dom('[data-test-orgIntegrations-integratedUI-hostURL]').doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-integratedUI-property]')
    .doesNotExist();

  assert
    .dom(
      `[data-test-orgIntegrations-serviceNow-serviceNowTableSelect] .${classes.trigger}`
    )
    .hasText(t('serviceNow.selectServiceNowTable'));

  assert
    .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
    .doesNotExist();
};

const assertIntegratedUI = async (assert, sNIntegrationInfo) => {
  assert
    .dom('[data-test-org-integration-card-description="ServiceNow"]')
    .exists();

  assert
    .dom('[data-test-org-integration-card-manageBtn]')
    .isNotDisabled()
    .hasText(t('manage'));

  await click('[data-test-org-integration-card-manageBtn]');

  assert
    .dom('[data-test-orgIntegrations-serviceNow-instanceURLInput]')
    .doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-serviceNow-usernameInput]')
    .doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-serviceNow-passwordInput]')
    .doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-serviceNow-selectServiceNowTableTitle]')
    .doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
    .doesNotExist();

  // Test integrated header
  assert.dom('[data-test-orgIntegrations-integratedUI-logo]').exists();

  assert
    .dom('[data-test-orgIntegrations-integratedUI-hostURL]')
    .hasText(sNIntegrationInfo.instance_url);

  assert
    .dom('[data-test-orgIntegrations-integratedUI-property]')
    .hasText(sNIntegrationInfo.username);

  assert
    .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
    .isNotDisabled()
    .hasText(t('disconnect'));
};

module(
  'Integration | Component | organization/integrations/service-now',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders ServiceNow not integrated', async function (assert) {
      assert.expect();

      this.server.get('/organizations/:id/servicenow', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::ServiceNow />`);

      assert
        .dom('[data-test-org-integration-card-title="ServiceNow"]')
        .hasText(t('serviceNow.title'));

      await assertNonIntegratedUI(assert);
    });

    test('it renders ServiceNow integrated', async function (assert) {
      assert.expect();

      const sNIntegrationInfo = {
        instance_url: 'sample-url2.com',
        username: 'sample',
        password: 'test_password', //NOSONAR
        table_name: 1,
      };

      this.server.get('/organizations/:id/servicenow', () => {
        return sNIntegrationInfo;
      });

      await render(hbs`<Organization::Integrations::ServiceNow />`);

      assertIntegratedUI(assert, sNIntegrationInfo);

      assert
        .dom('[data-test-org-integration-card-title="ServiceNow"]')
        .hasText(t('serviceNow.title'));
    });

    test.each(
      'it should disconnect ServiceNow integration',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        const sNIntegrationInfo = {
          instance_url: 'sample-url2.com',
          username: 'sample',
          password: 'test_password', //NOSONAR
          table_name: 1,
        };

        this.set('notIntegratedRes', false);

        this.server.get('/organizations/:id/servicenow', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          this.set('notIntegratedRes', true);

          return sNIntegrationInfo;
        });

        this.server.delete('/organizations/:id/servicenow', () => {
          return fail ? new Response(500) : new Response(200, {}, {});
        });

        await render(hbs`<Organization::Integrations::ServiceNow />`);

        assert
          .dom('[data-test-org-integration-card-title="ServiceNow"]')
          .hasText(t('serviceNow.title'));

        assert
          .dom('[data-test-org-integration-card-manageBtn]')
          .isNotDisabled()
          .hasText(t('manage'));

        await click('[data-test-org-integration-card-manageBtn]');

        const disconnectBtn = find(
          '[data-test-orgIntegrations-configDrawer-disconnectBtn]'
        );

        assert.dom(disconnectBtn).isNotDisabled().hasText(t('disconnect'));

        await click(disconnectBtn);

        assert
          .dom('[data-test-orgIntegrations-configDrawer-title]')
          .hasText(t('confirmation'));

        assert
          .dom(
            '[data-test-orgIntegrations-serviceNowAccount-revoke-confirmation]'
          )
          .hasText(t('confirmBox.revokeServiceNow'));

        assert
          .dom(
            '[data-test-orgIntegrations-serviceNowAccount-disconnectBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('yesDisconnect'));

        assert
          .dom(
            '[data-test-orgIntegrations-serviceNowAccount-cancelBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('cancel'));

        await click(
          '[data-test-orgIntegrations-serviceNowAccount-disconnectBtnConfirmation]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          assert.dom('[data-test-orgIntegrations-configDrawer-title]').exists();
          assert
            .dom(
              '[data-test-orgIntegrations-serviceNowAccount-revoke-confirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-serviceNowAccount-disconnectBtnConfirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-serviceNowAccount-cancelBtnConfirmation]'
            )
            .exists();

          await click(
            '[data-test-orgIntegrations-serviceNowAccount-cancelBtnConfirmation]'
          );

          assertIntegratedUI(assert, sNIntegrationInfo);
        } else {
          assert.strictEqual(notify.successMsg, t('serviceNow.willBeRevoked'));

          assert
            .dom(
              '[data-test-orgIntegrations-serviceNowAccount-revoke-confirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-serviceNowAccount-disconnectBtnConfirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-serviceNowAccount-cancelBtnConfirmation]'
            )
            .doesNotExist();

          await assertNonIntegratedUI(assert);
        }
      }
    );

    test('it should validate ServiceNow inputs', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => {
        return new Response(404, {}, {});
      });

      await render(hbs`<Organization::Integrations::ServiceNow />`);

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
        .isNotDisabled()
        .hasText(t('integrate'));

      assert
        .dom('[data-test-text-input-outlined]')
        .doesNotHaveClass(/ak-error-text-input/);

      await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

      assert
        .dom('[data-test-text-input-outlined]')
        .hasClass(/ak-error-text-input/);
    });

    test.each(
      'it should integrate ServiceNow',
      [
        { fail: false },
        {
          fail: true,
          error: { instance_url: ['instance_url is missing'] },
          errorMsg: () => 'instance_url - instance_url is missing',
        },
        {
          fail: true,
          error: { username: ['username not valid'] },
          errorMsg: () => 'username - username not valid',
        },
      ],
      async function (assert, { fail, error, errorMsg }) {
        this.set('notIntegratedRes', true);

        const sNIntegrationInfo = {
          instance_url: 'sample-url2.com',
          username: 'sample',
          password: 'test_password', //NOSONAR
          table_name: 1,
        };

        // For the service now table row
        const snTableItems = [
          {
            label: 'sn_vul_app_vulnerable_item',
            value: ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_APP_VULNERABLE_ITEM,
          },
          {
            label: 'sn_vul_vulnerable_item',
            value: ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_VULNERABLE_ITEM,
          },
        ];

        // Server Mocks
        this.server.get('/organizations/:id/servicenow', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          return sNIntegrationInfo;
        });

        this.server.post('/organizations/:id/servicenow', (_, req) => {
          const requestBody = JSON.parse(req.requestBody);

          if (!fail) {
            this.set('notIntegratedRes', false);
          }

          return fail ? new Response(400, {}, error) : requestBody;
        });

        // Test start
        await render(hbs`<Organization::Integrations::ServiceNow />`);

        await assertNonIntegratedUI(assert);

        await fillIn(
          '[data-test-orgIntegrations-serviceNow-instanceURLInput]',
          sNIntegrationInfo.instance_url
        );

        await fillIn(
          '[data-test-orgIntegrations-serviceNow-usernameInput]',
          sNIntegrationInfo.username
        );

        await fillIn(
          '[data-test-orgIntegrations-serviceNow-passwordInput]',
          sNIntegrationInfo.password
        );

        assert
          .dom('[data-test-orgIntegrations-serviceNow-instanceURLInput]')
          .hasValue(sNIntegrationInfo.instance_url);

        assert
          .dom('[data-test-orgIntegrations-serviceNow-usernameInput]')
          .hasValue(sNIntegrationInfo.username);

        assert
          .dom('[data-test-orgIntegrations-serviceNow-passwordInput]')
          .hasValue(sNIntegrationInfo.password);

        // Select and assert instance table
        const selectedTableRow = snTableItems.find(
          (r) => r.value === sNIntegrationInfo.table_name
        );

        await selectChoose(
          `[data-test-orgIntegrations-serviceNow-serviceNowTableSelect] .${classes.trigger}`,
          selectedTableRow.label
        );

        assert
          .dom(
            `[data-test-orgIntegrations-serviceNow-serviceNowTableSelect] .${classes.trigger}`
          )
          .hasText(selectedTableRow.label);

        await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, errorMsg());

          // Inputs should still retain values
          assert
            .dom('[data-test-orgIntegrations-serviceNow-instanceURLInput]')
            .hasValue(sNIntegrationInfo.instance_url);

          assert
            .dom('[data-test-orgIntegrations-serviceNow-usernameInput]')
            .hasValue(sNIntegrationInfo.username);

          assert
            .dom('[data-test-orgIntegrations-serviceNow-passwordInput]')
            .hasValue(sNIntegrationInfo.password);

          assert
            .dom(
              `[data-test-orgIntegrations-serviceNow-serviceNowTableSelect] .${classes.trigger}`
            )
            .hasText(selectedTableRow.label);
        } else {
          assert.strictEqual(notify.successMsg, t('serviceNowIntegrated'));

          assertIntegratedUI(assert, sNIntegrationInfo);
        }
      }
    );
  }
);
