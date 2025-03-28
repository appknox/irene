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

      assert.dom('[data-test-jiraAccount-title]').hasText(t('jiraIntegration'));

      assert
        .dom('[data-test-jiraAccount-desc]')
        .hasText(t('jiraIntegrationDesc'));

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
        .dom('[data-test-jiraAccount-integrateBtn]')
        .isNotDisabled()
        .hasText(t('integrateJIRA'));

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
          '[data-test-orgIntegrations-integratedUI-username]',
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

      assert.dom('[data-test-jiraAccount-title]').hasText(t('jiraIntegration'));

      assert.dom('[data-test-jiraAccount-desc]').doesNotExist();
      assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();
      assert.dom('[data-test-jiraAccount-usernameInput]').doesNotExist();
      assert.dom('[data-test-jiraAccount-apiKeyInput]').doesNotExist();
      assert.dom('[data-test-jiraAccount-integrateBtn]').doesNotExist();

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
          '[data-test-orgIntegrations-integratedUI-username]',
          integratedUIContainer
        )
        .hasText('appknox');

      assert
        .dom(
          '[data-test-orgIntegrations-integratedUI-disconnectBtn]',
          integratedUIContainer
        )
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
          .dom('[data-test-jiraAccount-title]')
          .hasText(t('jiraIntegration'));

        const disconnecBtn = find(
          '[data-test-orgIntegrations-jiraAccount-integratedHeader] [data-test-orgIntegrations-integratedUI-disconnectBtn]'
        );

        assert.dom(disconnecBtn).isNotDisabled().hasText(t('disconnect'));

        await click(disconnecBtn);

        assert.dom('[data-test-ak-modal-header]').hasText(t('confirm'));

        assert
          .dom('[data-test-confirmbox-description]')
          .hasText(t('confirmBox.revokeJira'));

        assert
          .dom('[data-test-confirmbox-confirmBtn]')
          .isNotDisabled()
          .hasText(t('disconnect'));

        assert
          .dom('[data-test-confirmbox-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        await click('[data-test-confirmbox-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          assert.dom('[data-test-ak-modal-header]').exists();
          assert.dom('[data-test-confirmbox-description]').exists();
          assert.dom('[data-test-confirmbox-confirmBtn]').exists();
          assert.dom('[data-test-confirmbox-cancelBtn]').exists();

          assert.dom('[data-test-jiraAccount-desc]').doesNotExist();
          assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-usernameInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-apiKeyInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-integrateBtn]').doesNotExist();
        } else {
          assert.strictEqual(notify.successMsg, t('jiraWillBeRevoked'));

          assert.dom('[data-test-ak-modal-header]').doesNotExist();
          assert.dom('[data-test-confirmbox-description]').doesNotExist();
          assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
          assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();

          assert
            .dom('[data-test-jiraAccount-desc]')
            .hasText(t('jiraIntegrationDesc'));

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
            .dom('[data-test-jiraAccount-integrateBtn]')
            .isNotDisabled()
            .hasText(t('integrateJIRA'));
        }
      }
    );

    test('it should validate jira-account inputs', async function (assert) {
      this.server.get('/organizations/:id/integrate_jira', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::JiraAccount />`);

      assert
        .dom('[data-test-jiraAccount-integrateBtn]')
        .isNotDisabled()
        .hasText(t('integrateJIRA'));

      assert
        .dom('[data-test-text-input-outlined]')
        .doesNotHaveClass(/ak-error-text-input/);

      await click('[data-test-jiraAccount-integrateBtn]');

      assert
        .dom('[data-test-text-input-outlined]')
        .hasClass(/ak-error-text-input/);
    });

    test.each(
      'it should integrate jira-account',
      [
        { fail: false },
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
      async function (assert, { fail, error, errorMsg }) {
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
          .dom('[data-test-jiraAccount-integrateBtn]')
          .isNotDisabled()
          .hasText(t('integrateJIRA'));

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

        await click('[data-test-jiraAccount-integrateBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, errorMsg());

          assert.dom('[data-test-jiraAccount-desc]').exists();
          assert.dom('[data-test-jiraAccount-hostInput]').exists();
          assert.dom('[data-test-jiraAccount-usernameInput]').exists();
          assert.dom('[data-test-jiraAccount-apiKeyInput]').exists();
          assert.dom('[data-test-jiraAccount-integrateBtn]').isNotDisabled();
        } else {
          assert.strictEqual(notify.successMsg, t('jiraIntegrated'));

          assert.dom('[data-test-jiraAccount-hostInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-usernameInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-apiKeyInput]').doesNotExist();
          assert.dom('[data-test-jiraAccount-integrateBtn]').doesNotExist();

          // Test integrated UI
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
            .hasText(jiraIntegrationProps.host);

          assert
            .dom(
              '[data-test-orgIntegrations-integratedUI-username]',
              integratedUIContainer
            )
            .hasText(jiraIntegrationProps.username);

          assert
            .dom(
              '[data-test-orgIntegrations-integratedUI-disconnectBtn]',
              integratedUIContainer
            )
            .isNotDisabled()
            .hasText(t('disconnect'));
        }
      }
    );
  }
);
