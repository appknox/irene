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

      // The card also reflects Jira Cloud Security, which shares this drawer.
      this.server.get('/organizations/:id/jira_security', () => ({
        status: 'not_connected',
        connected_on: null,
        configure_path: '/jira/settings/apps/configure/app-uuid/env-uuid',
      }));
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

      // The type radios stay: they are how an admin with Jira already connected
      // reaches the Jira Cloud Security setup in the same drawer.
      assert.dom('[data-test-jiraAccount-jiraType-cloud]').exists();
      assert.dom('[data-test-jiraAccount-jiraType-cloudSecurity]').exists();
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
    test('it offers Jira Cloud Security as a third Jira type', async function (assert) {
      // One product, one card: the security integration is a tab in the same
      // drawer rather than a card of its own.
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert.dom('[data-test-jiraAccount-hostInput]').exists();

      await click('[data-test-jiraAccount-jiraType-cloudSecurity]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.notConnected'));

      // The credential form belongs to the other Jira types.
      assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();

      // The security panel carries its own buttons, so the shared footer would
      // only offer actions that do not apply to it.
      assert
        .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
        .doesNotExist();
    });

    test('it opens on the Jira type that is already connected', async function (assert) {
      // An admin reopening the drawer wants to manage what they set up, not to
      // re-pick it from the top of the list.
      this.server.get('/organizations/:id/integrate_jira', () => ({
        host: 'https://appknox.example.com/',
        username: 'appknox',
        is_data_center: true,
      }));

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-manageBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-dataCenter]').isChecked();
      assert.dom('[data-test-jiraAccount-jiraType-cloud]').isNotChecked();
    });

    test('it opens on Jira Cloud Security when that is the live connection', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      this.server.get('/organizations/:id/jira_security', () => ({
        status: 'connected',
        connected_on: '2026-09-22T10:00:00Z',
        configure_path: '/jira/settings/apps/configure/app-uuid/env-uuid',
      }));

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-manageBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-cloudSecurity]').isChecked();

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.connected'));
    });

    test('it falls back to Jira Cloud when nothing is connected', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-cloud]').isChecked();
    });

    test('it locks out Jira Cloud Security while Jira is integrated', async function (assert) {
      // An organization runs one Jira integration at a time; the API refuses
      // the combination, so the drawer must not offer it.
      this.server.get('/organizations/:id/integrate_jira', () => ({
        host: 'https://appknox.atlassian.net/',
        username: 'appknox',
      }));

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-manageBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-cloudSecurity]').isDisabled();
      assert.dom('[data-test-jiraAccount-jiraType-cloud]').isNotDisabled();

      assert
        .dom('[data-test-jiraAccount-oneAtATimeNote]')
        .hasText(t('jiraOneIntegrationAtATime'));
    });

    test('it locks out Jira once Jira Cloud Security setup has begun', async function (assert) {
      // From the moment a secret exists, not just once Jira confirms: that is
      // when the API starts refusing the other integration.
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      this.server.get('/organizations/:id/jira_security', () => ({
        status: 'awaiting_jira',
        connected_on: null,
        configure_path: '/jira/settings/apps/configure/app-uuid/env-uuid',
      }));

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-cloud]').isDisabled();
      assert.dom('[data-test-jiraAccount-jiraType-dataCenter]').isDisabled();

      assert
        .dom('[data-test-jiraAccount-jiraType-cloudSecurity]')
        .isNotDisabled()
        .isChecked();
    });

    test('it leaves every Jira type open when nothing is connected', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert.dom('[data-test-jiraAccount-jiraType-cloud]').isNotDisabled();
      assert.dom('[data-test-jiraAccount-jiraType-dataCenter]').isNotDisabled();

      assert
        .dom('[data-test-jiraAccount-jiraType-cloudSecurity]')
        .isNotDisabled();

      assert.dom('[data-test-jiraAccount-oneAtATimeNote]').doesNotExist();
    });

    test('it marks the card integrated when only Jira Cloud Security is connected', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      this.server.get('/organizations/:id/jira_security', () => ({
        status: 'connected',
        connected_on: '2026-09-22T10:00:00Z',
        configure_path: '/jira/settings/apps/configure/app-uuid/env-uuid',
      }));

      await render(hbs`<Organization::Integrations::JiraAccount />`);

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .exists()
        .hasText(t('manage'));
    });
  }
);
