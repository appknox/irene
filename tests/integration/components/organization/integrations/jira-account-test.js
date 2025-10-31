import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import Service from '@ember/service';

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

module(
  'Integration | Component | organization/integrations/jira-account',
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

    test('it renders jira-account not integrated', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);

      assert
        .dom('[data-test-org-integration-card-title="JIRA"]')
        .hasText(t('jira'));

      assert
        .dom('[data-test-org-integration-card-description="JIRA"]')
        .hasText(t('jiraIntegrationDesc'));

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-configDrawer-title]')
        .hasText(t('jiraIntegration'));

      assert.dom('[data-test-jiraAccount-jiraType-cloud]').isChecked();

      assert.dom('[data-test-jiraAccount-jiraType-dataCenter]').isNotChecked();

      assert
        .dom('[data-test-jiraAccount-hostInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-jiraAccount-usernameInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-jiraAccount-apiKeyInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
        .isNotDisabled()
        .hasText(t('integrate'));

      // Integrated UI should not be visible
      const integratedUIContainer = find(
        '[data-test-orgIntegrations-jiraAccount-integratedHeader]'
      );

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-logo]',
          integratedUIContainer
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-hostURL]',
          integratedUIContainer
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-property]',
          integratedUIContainer
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-disconnectBtn]',
          integratedUIContainer
        )
        .doesNotExist();
    });

    test('it renders jira-account integrated', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return { host: 'https://appknox.atlassian.net/', username: 'appknox' };
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);

      assert
        .dom('[data-test-org-integration-card-title="JIRA"]')
        .hasText(t('jira'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert.dom('[data-test-org-integration-card-integrated-chip]').exists();

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .exists()
        .containsText(t('manage'));

      await click('[data-test-org-integration-card-manageBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-cloud]').doesNotExist();
      assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();
      assert.dom('[data-test-jiraAccount-usernameInput]').doesNotExist();
      assert.dom('[data-test-jiraAccount-apiKeyInput]').doesNotExist();
      assert
        .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
        .doesNotExist();

      const integratedUIContainer = find(
        '[data-test-orgIntegrations-jiraAccount-integratedHeader]'
      );

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-logo]',
          integratedUIContainer
        )
        .exists();

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-hostURL]',
          integratedUIContainer
        )
        .hasText('https://appknox.atlassian.net/');

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-property]',
          integratedUIContainer
        )
        .hasText('appknox');

      assert
        .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
        .isNotDisabled()
        .hasText(t('disconnect'));
    });

    test.each(
      'it should disconnect jira-account integrated',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.set('notIntegratedRes', false);

        this.server.get('/organizations/:id/integrate_jira', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          this.set('notIntegratedRes', true);

          return {
            host: 'https://appknox.atlassian.net/',
            username: 'appknox',
          };
        });

        this.server.delete('/organizations/:id/integrate_jira', () => {
          return fail ? new Response(500) : {};
        });

        await render(hbs`<Organization::Integrations::JiraAccount />`);

        assert
          .dom('[data-test-org-integration-card-title="JIRA"]')
          .hasText(t('jira'));

        assert.dom('[data-test-org-integration-card-logo]').exists();

        assert.dom('[data-test-org-integration-card-integrated-chip]').exists();

        assert
          .dom('[data-test-org-integration-card-manageBtn]')
          .exists()
          .containsText(t('manage'));

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
          .dom('[data-test-orgIntegrations-jiraAccount-revoke-confirmation]')
          .hasText(t('confirmBox.revokeJira'));

        assert
          .dom(
            '[data-test-orgIntegrations-jiraAccount-disconnectBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('yesDisconnect'));

        assert
          .dom('[data-test-orgIntegrations-jiraAccount-cancelBtnConfirmation]')
          .isNotDisabled()
          .hasText(t('cancel'));

        await click(
          '[data-test-orgIntegrations-jiraAccount-disconnectBtnConfirmation]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          assert.dom('[data-test-orgIntegrations-configDrawer-title]').exists();
          assert
            .dom('[data-test-orgIntegrations-jiraAccount-revoke-confirmation]')
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-jiraAccount-disconnectBtnConfirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-jiraAccount-cancelBtnConfirmation]'
            )
            .exists();

          assert
            .dom('[data-test-org-integration-card-connectBtn]')
            .doesNotExist();

          assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-usernameInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-apiKeyInput]').doesNotExist();
          assert
            .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
            .doesNotExist();
        } else {
          assert.strictEqual(notify.successMsg, t('jiraWillBeRevoked'));

          assert
            .dom('[data-test-orgIntegrations-jiraAccount-revoke-confirmation]')
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-jiraAccount-disconnectBtnConfirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-jiraAccount-cancelBtnConfirmation]'
            )
            .doesNotExist();

          assert
            .dom('[data-test-org-integration-card-description="JIRA"]')
            .hasText(t('jiraIntegrationDesc'));

          assert
            .dom('[data-test-org-integration-card-connectBtn]')
            .isNotDisabled()
            .hasText(t('connect'));

          await click('[data-test-org-integration-card-connectBtn]');

          assert
            .dom('[data-test-jiraAccount-hostInput]')
            .isNotDisabled()
            .hasNoValue();

          assert
            .dom('[data-test-jiraAccount-usernameInput]')
            .isNotDisabled()
            .hasNoValue();

          assert
            .dom('[data-test-jiraAccount-apiKeyInput]')
            .isNotDisabled()
            .hasNoValue();
        }
      }
    );

    test('it should validate jira-account inputs', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);

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
      'it should integrate jira-account',
      [
        { fail: false, dataCenter: false },
        { fail: false, dataCenter: true },
        { fail: true, errorMsg: () => t('pleaseTryAgain') },
        {
          fail: true,
          error: { host: ['https://appknox.atlassian.net/'] },
          errorMsg: () => 'https://appknox.atlassian.net/',
        },
        {
          fail: true,
          error: { username: ['username not valid'] },
          errorMsg: () => t('tInValidCredentials'),
        },
        {
          fail: true,
          error: { password: ['password not valid'] },
          errorMsg: () => t('tInValidCredentials'),
        },
      ],
      async function (assert, { fail, error, errorMsg, dataCenter }) {
        const jiraIntegrationProps = {
          host: 'https://appknox.atlassian.net/',
          username: 'appknox',
          password: 'test_password', //NOSONAR
        };

        this.set('notIntegratedRes', true);

        this.server.get('/organizations/:id/integrate_jira', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          return jiraIntegrationProps;
        });

        this.server.post('/organizations/:id/integrate_jira', () => {
          if (!fail) {
            this.set('notIntegratedRes', false);
          }

          return fail ? new Response(500, {}, error) : {};
        });

        await render(hbs`<Organization::Integrations::JiraAccount />`);

        assert
          .dom('[data-test-org-integration-card-connectBtn]')
          .isNotDisabled()
          .hasText(t('connect'));

        await click('[data-test-org-integration-card-connectBtn]');

        if (dataCenter) {
          assert.dom('[data-test-jiraAccount-jiraType-cloud]').isChecked();

          assert
            .dom('[data-test-jiraAccount-jiraType-dataCenter]')
            .isNotChecked();

          await click('[data-test-jiraAccount-jiraType-dataCenter]');

          assert.dom('[data-test-jiraAccount-jiraType-cloud]').isNotChecked();

          assert.dom('[data-test-jiraAccount-jiraType-dataCenter]').isChecked();
        }

        assert
          .dom('[data-test-jiraAccount-hostInput]')
          .isNotDisabled()
          .hasNoValue();

        assert
          .dom('[data-test-jiraAccount-usernameInput]')
          .isNotDisabled()
          .hasNoValue();

        assert
          .dom('[data-test-jiraAccount-apiKeyInput]')
          .isNotDisabled()
          .hasNoValue();

        assert
          .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
          .isNotDisabled()
          .hasText(t('integrate'));

        await fillIn(
          '[data-test-jiraAccount-hostInput]',
          jiraIntegrationProps.host
        );

        await fillIn(
          '[data-test-jiraAccount-usernameInput]',
          jiraIntegrationProps.username
        );

        await fillIn(
          '[data-test-jiraAccount-apiKeyInput]',
          jiraIntegrationProps.password
        );

        assert
          .dom('[data-test-jiraAccount-hostInput]')
          .hasValue(jiraIntegrationProps.host);

        assert
          .dom('[data-test-jiraAccount-usernameInput]')
          .hasValue(jiraIntegrationProps.username);

        assert
          .dom('[data-test-jiraAccount-apiKeyInput]')
          .hasValue(jiraIntegrationProps.password);

        await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, errorMsg());

          assert
            .dom('[data-test-org-integration-card-description="JIRA"]')
            .exists();
          assert.dom('[data-test-jiraAccount-hostInput]').exists();
          assert.dom('[data-test-jiraAccount-usernameInput]').exists();
          assert.dom('[data-test-jiraAccount-apiKeyInput]').exists();
          assert
            .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
            .isNotDisabled();
        } else {
          assert.strictEqual(notify.successMsg, t('jiraIntegrated'));

          assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-usernameInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-apiKeyInput]').doesNotExist();
          assert
            .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
            .doesNotExist();

          // Test integrated UI
          assert.dom('[data-test-orgIntegrations-integratedUI-logo]').exists();

          assert
            .dom('[data-test-orgIntegrations-integratedUI-hostURL]')
            .hasText(jiraIntegrationProps.host);

          assert
            .dom('[data-test-orgIntegrations-integratedUI-property]')
            .hasText(jiraIntegrationProps.username);

          assert
            .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
            .isNotDisabled()
            .hasText(t('disconnect'));
        }
      }
    );

    test('it shows error messages for empty fields', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      const jiraIntegrationProps = {
        host: 'https://appknox.atlassian.net/',
        username: 'appknox',
      };

      await render(hbs`<Organization::Integrations::JiraAccount />`);

      assert
        .dom('[data-test-org-integration-card-title="JIRA"]')
        .hasText(t('jira'));

      assert
        .dom('[data-test-org-integration-card-description="JIRA"]')
        .hasText(t('jiraIntegrationDesc'));

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-configDrawer-title]')
        .hasText(t('jiraIntegration'));

      await fillIn(
        '[data-test-jiraAccount-hostInput]',
        jiraIntegrationProps.host
      );

      await fillIn(
        '[data-test-jiraAccount-usernameInput]',
        jiraIntegrationProps.username
      );

      await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        `${t('apiKey')} ${t('canNotBeEmpty')}`
      );

      await click('[data-test-jiraAccount-jiraType-dataCenter]');

      await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

      assert.strictEqual(
        notify.errorMsg,
        `${t('accessToken')} ${t('canNotBeEmpty')}`
      );
    });
  }
);
