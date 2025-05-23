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
    .dom('[data-test-org-integration-card-description="Splunk"]')
    .hasText(t('splunkIntegrationDesc'));

  assert
    .dom('[data-test-org-integration-card-connectBtn]')
    .isNotDisabled()
    .hasText(t('connect'));

  await click('[data-test-org-integration-card-connectBtn]');

  assert
    .dom('[data-test-orgIntegrations-splunk-instanceURLInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-splunk-hecTokenInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-splunk-apiTokenInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-splunk-saveAndProceed]')
    .isNotDisabled()
    .hasText(t('saveAndProceed'));

  // Integrated UI should not be visible
  assert.dom('[data-test-orgIntegrations-integratedUI-logo]').doesNotExist();

  assert.dom('[data-test-orgIntegrations-integratedUI-hostURL]').doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-integratedUI-property]')
    .doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
    .doesNotExist();
};

const assertIntegratedUI = async (assert, splunkIntegrationInfo) => {
  assert.dom('[data-test-org-integration-card-description="Splunk"]').exists();

  assert
    .dom('[data-test-org-integration-card-manageBtn]')
    .isNotDisabled()
    .hasText(t('manage'));

  await click('[data-test-org-integration-card-manageBtn]');

  assert
    .dom('[data-test-orgIntegrations-splunk-instanceURLInput]')
    .doesNotExist();

  assert.dom('[data-test-orgIntegrations-splunk-hecTokenInput]').doesNotExist();

  assert.dom('[data-test-orgIntegrations-splunk-apiTokenInput]').doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-splunk-saveAndProceed]')
    .doesNotExist();

  // Test integrated header
  assert.dom('[data-test-orgIntegrations-integratedUI-logo]').exists();

  assert
    .dom('[data-test-orgIntegrations-integratedUI-hostURL]')
    .hasText(splunkIntegrationInfo.instance_url);

  assert
    .dom('[data-test-orgIntegrations-integratedUI-property]')
    .hasText(splunkIntegrationInfo.vulnerability_index);

  assert
    .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
    .isNotDisabled()
    .hasText(t('disconnect'));
};

module(
  'Integration | Component | organization/integrations/splunk',
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

    test('it renders Splunk not integrated', async function (assert) {
      assert.expect();

      this.server.get('/organizations/:id/splunk', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::Splunk />`);

      assert
        .dom('[data-test-org-integration-card-title="Splunk"]')
        .hasText(t('splunk.title'));

      await assertNonIntegratedUI(assert);
    });

    test('it renders Splunk integrated', async function (assert) {
      assert.expect();

      const splunkIntegrationInfo = {
        instance_url: 'sample-url2.com',
        hec_token: 'abcd-1234',
        api_token: 'ABCD-1234-EFGH',
        vulnerability_index: 'index1',
      };

      this.server.get('/organizations/:id/splunk', () => {
        return splunkIntegrationInfo;
      });

      await render(hbs`<Organization::Integrations::Splunk />`);

      assertIntegratedUI(assert, splunkIntegrationInfo);

      assert
        .dom('[data-test-org-integration-card-title="Splunk"]')
        .hasText(t('splunk.title'));
    });

    test('it toggles user logs and shows/hides related fields', async function (assert) {
      const indexes = { indexes: ['index1', 'index2', 'index3'] };
      const splunkIntegrationInfo = {
        instance_url: 'sample-url2.com',
        hec_token: 'abcd-1234',
        api_token: 'ABCD-1234-EFGH',
        vulnerability_index: 'index1',
      };

      this.server.get('/organizations/:id/splunk', () => {
        return new Response(404);
      });

      this.server.post('/organizations/:id/splunk', () => {
        return splunkIntegrationInfo;
      });

      this.server.get('/organizations/:id/splunk/indexes', () => {
        return indexes;
      });

      await render(hbs`<Organization::Integrations::Splunk />`);

      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-splunkAccount-stepTitle]')
        .hasText(t('configureStep1'));

      // Fill step 1 form
      await fillIn(
        '[data-test-orgIntegrations-splunk-instanceURLInput]',
        splunkIntegrationInfo.instance_url
      );
      await fillIn(
        '[data-test-orgIntegrations-splunk-hecTokenInput]',
        splunkIntegrationInfo.hec_token
      );
      await fillIn(
        '[data-test-orgIntegrations-splunk-apiTokenInput]',
        splunkIntegrationInfo.api_token
      );

      await click('[data-test-orgIntegrations-splunk-saveAndProceed]');

      assert
        .dom('[data-test-orgIntegrations-splunkAccount-stepTitle]')
        .hasText(t('configureStep2'));

      const toggleSelector =
        '[data-test-orgIntegrations-splunkAccount-userLogs-toggle] [data-test-toggle-input]';

      // Initially user logs should be disabled
      assert.dom(toggleSelector).exists();

      // User logs fields should not exist initially
      assert
        .dom('[data-test-orgIntegrations-splunk-userLogsSelect]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-splunk-logHoursSelect]')
        .doesNotExist();

      // Toggle user logs on
      await click(toggleSelector);

      assert.dom(toggleSelector).isChecked();

      // User logs fields should now be visible
      assert.dom('[data-test-orgIntegrations-splunk-userLogsSelect]').exists();

      assert.dom('[data-test-orgIntegrations-splunk-logHoursSelect]').exists();

      // Toggle user logs off
      await click(toggleSelector);

      // User logs fields should be hidden again
      assert
        .dom('[data-test-orgIntegrations-splunk-userLogsSelect]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-splunk-logHoursSelect]')
        .doesNotExist();
    });

    test('it allows selecting user logs index and time interval', async function (assert) {
      const indexes = { indexes: ['index1', 'index2', 'index3'] };
      const splunkIntegrationInfo = {
        instance_url: 'sample-url2.com',
        hec_token: 'abcd-1234',
        api_token: 'ABCD-1234-EFGH',
        vulnerability_index: 'index1',
      };

      this.server.get('/organizations/:id/splunk', () => {
        return new Response(404);
      });

      this.server.post('/organizations/:id/splunk', () => {
        return splunkIntegrationInfo;
      });

      this.server.get('/organizations/:id/splunk/indexes', () => {
        return indexes;
      });

      await render(hbs`<Organization::Integrations::Splunk />`);

      await click('[data-test-org-integration-card-connectBtn]');

      // Fill step 1 form
      await fillIn(
        '[data-test-orgIntegrations-splunk-instanceURLInput]',
        splunkIntegrationInfo.instance_url
      );
      await fillIn(
        '[data-test-orgIntegrations-splunk-hecTokenInput]',
        splunkIntegrationInfo.hec_token
      );
      await fillIn(
        '[data-test-orgIntegrations-splunk-apiTokenInput]',
        splunkIntegrationInfo.api_token
      );

      await click('[data-test-orgIntegrations-splunk-saveAndProceed]');

      // Enable user logs
      await click(
        '[data-test-orgIntegrations-splunkAccount-userLogs-toggle] [data-test-toggle-input]'
      );

      // Select user logs index
      await selectChoose(
        `[data-test-orgIntegrations-splunk-userLogsSelect] .${classes.trigger}`,
        splunkIntegrationInfo.vulnerability_index
      );

      assert
        .dom(
          `[data-test-orgIntegrations-splunk-userLogsSelect] .${classes.trigger}`
        )
        .hasText(splunkIntegrationInfo.vulnerability_index);

      // Select time interval (assuming there are predefined options)
      const logHoursDropdown = find(
        `[data-test-orgIntegrations-splunk-logHoursSelect] .${classes.trigger}`
      );

      if (logHoursDropdown) {
        await click(logHoursDropdown);
        // Assuming there are time interval options available
        const firstOption = find('[data-option-index="0"]');
        if (firstOption) {
          await click(firstOption);
        }
      }
    });

    test('it shows edit button and allows editing user logs in integrated mode', async function (assert) {
      const splunkIntegrationInfo = {
        instance_url: 'sample-url2.com',
        hec_token: 'abcd-1234',
        api_token: 'ABCD-1234-EFGH',
        vulnerability_index: 'index1',
        send_user_logs: true,
        user_logs_index: 'index2',
        log_hour: 24,
      };

      const indexes = { indexes: ['index1', 'index2', 'index3'] };

      this.server.get('/organizations/:id/splunk', () => {
        return splunkIntegrationInfo;
      });

      this.server.post('/organizations/:id/splunk', (_, req) => {
        const requestBody = JSON.parse(req.requestBody);

        return requestBody;
      });

      this.server.get('/organizations/:id/splunk/indexes', () => {
        return indexes;
      });

      await render(hbs`<Organization::Integrations::Splunk />`);

      await click('[data-test-org-integration-card-manageBtn]');

      // Initially should show read-only values
      assert.dom('[data-test-orgIntegrations-splunk-userLogs]').exists();

      assert.dom('[data-test-orgIntegrations-splunk-logHours]').exists();

      // Edit button should be visible
      assert
        .dom('[data-test-orgIntegrations-splunk-editBtn]')
        .exists()
        .isNotDisabled();

      // Save button should not be visible initially
      assert
        .dom('[data-test-orgIntegrations-splunk-saveUserLogsBtn]')
        .doesNotExist();

      // Click edit button
      await click('[data-test-orgIntegrations-splunk-editBtn]');

      // Edit button should be hidden
      assert.dom('[data-test-orgIntegrations-splunk-editBtn]').doesNotExist();

      // Save button should now be visible
      assert
        .dom('[data-test-orgIntegrations-splunk-saveUserLogsBtn]')
        .exists()
        .isNotDisabled()
        .hasText(t('save'));

      // Dropdowns should be visible for editing
      assert.dom('[data-test-orgIntegrations-splunk-userLogsSelect]').exists();

      assert.dom('[data-test-orgIntegrations-splunk-logHoursSelect]').exists();

      // Read-only text should be hidden
      assert.dom('[data-test-orgIntegrations-splunk-userLogs]').doesNotExist();

      assert.dom('[data-test-orgIntegrations-splunk-logHours]').doesNotExist();

      // Change user logs index
      await selectChoose(
        `[data-test-orgIntegrations-splunk-userLogsSelect] .${classes.trigger}`,
        'index3'
      );

      // Save changes
      await click('[data-test-orgIntegrations-splunk-saveUserLogsBtn]');

      // Should return to read-only mode
      assert.dom('[data-test-orgIntegrations-splunk-editBtn]').exists();

      assert
        .dom('[data-test-orgIntegrations-splunk-userLogsSelect]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-splunk-logHoursSelect]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-splunk-userLogs]')
        .exists()
        .containsText('index3');

      assert
        .dom('[data-test-orgIntegrations-splunk-saveUserLogsBtn]')
        .doesNotExist();
    });

    test.each(
      'it should disconnect Splunk integration',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        const splunkIntegrationInfo = {
          instance_url: 'sample-url2.com',
          hec_token: 'abcd-1234',
          api_token: 'ABCD-1234-EFGH',
          vulnerability_index: 'index1',
        };

        this.set('notIntegratedRes', false);

        this.server.get('/organizations/:id/splunk', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          this.set('notIntegratedRes', true);

          return splunkIntegrationInfo;
        });

        this.server.delete('/organizations/:id/splunk', () => {
          return fail ? new Response(500) : new Response(200, {}, {});
        });

        await render(hbs`<Organization::Integrations::Splunk />`);

        assert
          .dom('[data-test-org-integration-card-title="Splunk"]')
          .hasText(t('splunk.title'));

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
          .dom('[data-test-orgIntegrations-splunkAccount-revoke-confirmation]')
          .hasText(t('confirmBox.revokeSplunk'));

        assert
          .dom(
            '[data-test-orgIntegrations-splunkAccount-disconnectBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('yesDisconnect'));

        assert
          .dom(
            '[data-test-orgIntegrations-splunkAccount-cancelBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('cancel'));

        await click(
          '[data-test-orgIntegrations-splunkAccount-disconnectBtnConfirmation]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          assert.dom('[data-test-orgIntegrations-configDrawer-title]').exists();
          assert
            .dom(
              '[data-test-orgIntegrations-splunkAccount-revoke-confirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-splunkAccount-disconnectBtnConfirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-splunkAccount-cancelBtnConfirmation]'
            )
            .exists();

          await click(
            '[data-test-orgIntegrations-splunkAccount-cancelBtnConfirmation]'
          );

          assertIntegratedUI(assert, splunkIntegrationInfo);
        } else {
          assert.strictEqual(notify.successMsg, t('splunk.willBeRevoked'));

          assert
            .dom(
              '[data-test-orgIntegrations-splunkAccount-revoke-confirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-splunkAccount-disconnectBtnConfirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-splunkAccount-cancelBtnConfirmation]'
            )
            .doesNotExist();

          await assertNonIntegratedUI(assert);
        }
      }
    );

    test('it should validate Splunk inputs', async function (assert) {
      this.server.get('/organizations/:id/splunk', () => {
        return new Response(404, {}, {});
      });

      await render(hbs`<Organization::Integrations::Splunk />`);

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-splunk-saveAndProceed]')
        .isNotDisabled()
        .hasText(t('saveAndProceed'));

      const notify = this.owner.lookup('service:notifications');

      await click('[data-test-orgIntegrations-splunk-saveAndProceed]');

      assert.strictEqual(
        notify.errorMsg,
        'Please fill all the required fields'
      );
    });

    test.each(
      'it should integrate Splunk',
      [
        { fail: false },
        {
          fail: true,
          error: { instance_url: ['Instance url must be a valid url'] },
          errorMsg: () => 'instance_url - Instance url must be a valid url',
        },
      ],
      async function (assert, { fail, error, errorMsg }) {
        this.set('notIntegratedRes', true);

        const splunkIntegrationInfo = {
          instance_url: 'https://sample-url2.com',
          hec_token: 'abcd-1234',
          api_token: 'ABCD-1234-EFGH',
          vulnerability_index: 'index1',
        };

        const indexes = { indexes: ['index1', 'index2', 'index3'] };

        // Server Mocks
        this.server.get('/organizations/:id/splunk', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          return splunkIntegrationInfo;
        });

        this.server.post('/organizations/:id/splunk', (_, req) => {
          const requestBody = JSON.parse(req.requestBody);

          if (!fail) {
            this.set('notIntegratedRes', false);
          }

          return fail ? new Response(400, {}, error) : requestBody;
        });

        this.server.get('/organizations/:id/splunk/indexes', () => {
          return indexes;
        });

        // Test start
        await render(hbs`<Organization::Integrations::Splunk />`);

        await assertNonIntegratedUI(assert);

        await fillIn(
          '[data-test-orgIntegrations-splunk-instanceURLInput]',
          splunkIntegrationInfo.instance_url
        );

        await fillIn(
          '[data-test-orgIntegrations-splunk-hecTokenInput]',
          splunkIntegrationInfo.hec_token
        );

        await fillIn(
          '[data-test-orgIntegrations-splunk-apiTokenInput]',
          splunkIntegrationInfo.api_token
        );

        assert
          .dom('[data-test-orgIntegrations-splunk-instanceURLInput]')
          .hasValue(splunkIntegrationInfo.instance_url);

        assert
          .dom('[data-test-orgIntegrations-splunk-hecTokenInput]')
          .hasValue(splunkIntegrationInfo.hec_token);

        assert
          .dom('[data-test-orgIntegrations-splunk-apiTokenInput]')
          .hasValue(splunkIntegrationInfo.api_token);

        await click('[data-test-orgIntegrations-splunk-saveAndProceed] ');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, errorMsg());
        } else {
          // Select and assert instance index
          const selectedIndex = indexes.indexes.find(
            (r) => r === splunkIntegrationInfo.vulnerability_index
          );

          await selectChoose(
            `[data-test-orgIntegrations-splunk-vulnIndexSelect] .${classes.trigger}`,
            selectedIndex
          );

          assert
            .dom(
              `[data-test-orgIntegrations-splunk-vulnIndexSelect] .${classes.trigger}`
            )
            .hasText(selectedIndex);

          assert
            .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
            .exists()
            .isNotDisabled();

          await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

          assert.strictEqual(notify.successMsg, t('splunkIntegrated'));

          assertIntegratedUI(assert, splunkIntegrationInfo);
        }
      }
    );
  }
);
