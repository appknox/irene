import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import ENV from 'irene/config/environment';

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

const CONFIGURE_PATH = '/jira/settings/apps/configure/app-uuid/env-uuid';

const INSTALL_URL =
  'https://developer.atlassian.com/console/install/app-uuid?signature=sig';

const statusResponse = (overrides = {}) => ({
  status: 'not_connected',
  connected_on: null,
  configure_path: CONFIGURE_PATH,
  ...overrides,
});

module(
  'Integration | Component | organization/integrations/jira-security',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);

      // The install link is deployment config, not API data.
      this.originalInstallUrl = ENV.jiraSecurityInstallUrl;
      ENV.jiraSecurityInstallUrl = INSTALL_URL;
    });

    hooks.afterEach(function () {
      ENV.jiraSecurityInstallUrl = this.originalInstallUrl;
    });

    test('it renders the card', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);

      assert
        .dom('[data-test-org-integration-card-title="JiraSecurity"]')
        .hasText(t('jiraSecurity.title'));
    });

    test('it shows the not-connected state', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.notConnected'));

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-generateBtn]')
        .isNotDisabled();

      // Nothing to disconnect or rotate before a secret exists.
      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-disconnectBtn]')
        .doesNotExist();
    });

    test('it distinguishes awaiting-Jira from connected', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ status: 'awaiting_jira' })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.awaitingJira'));

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-help]')
        .hasText(t('jiraSecurity.awaitingHelp'));
    });

    test('it shows the connected state', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({
          status: 'connected',
          connected_on: '2026-09-15T08:00:00Z',
        })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      // A connected integration renders "manage" in place of "connect".
      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.connected'));

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-disconnectBtn]')
        .exists();

      // The site field is only for getting to Jira during setup.
      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-siteInput]')
        .doesNotExist();
    });

    test('it shows the generated secret once, with a warning', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');
      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secret]')
        .hasValue('a-very-long-generated-shared-secret-value');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secretWarning]')
        .hasText(t('jiraSecurity.secretShownOnce'));
    });

    test('it forgets the secret when the drawer is closed', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');
      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');
      await click('[data-test-orgIntegrations-configDrawer-closeBtn]');
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secret]')
        .doesNotExist();
    });

    test('it rejects a site address that is not a Jira site', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');
      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');

      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'evil.example.com'
      );

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-siteError]')
        .hasText(t('jiraSecurity.invalidSite'));

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-continueBtn]')
        .isDisabled();
    });

    test('it accepts a site address pasted as a full URL', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');
      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');

      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'https://acme.atlassian.net/jira/software'
      );

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-siteError]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-continueBtn]')
        .isNotDisabled();
    });

    test('it falls back to written steps when no configure path is set', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ configure_path: null })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-manualSteps]')
        .hasText(t('jiraSecurity.manualSteps'));

      // A button that can never be enabled is noise beside the instructions.
      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-continueBtn]')
        .doesNotExist();
    });

    test('it re-checks status each time the drawer is opened', async function (assert) {
      // The middle step of setup happens in Jira, in another tab. Nothing
      // notifies this page, so a stale state must not persist.
      let status = 'awaiting_jira';

      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ status })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.awaitingJira'));

      // Jira confirms while the admin is away.
      status = 'connected';

      await click('[data-test-orgIntegrations-configDrawer-closeBtn]');
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.connected'));
    });

    test('it offers the install step while setting up', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-installBtn]')
        .exists();
    });

    test('it drops the install step once connected', async function (assert) {
      // An admin managing a live connection has already installed the app.
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ status: 'connected' })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-installBtn]')
        .doesNotExist();
    });

    test('it hides the install step when no link is configured', async function (assert) {
      ENV.jiraSecurityInstallUrl = '';

      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-installBtn]')
        .doesNotExist();
    });

    test('it withholds the Jira link until a secret exists', async function (assert) {
      // The Jira page asks for a secret; arriving without one is a dead end.
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-connectBtn]');

      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-continueBtn]')
        .doesNotExist();
    });

    test('it warns before regenerating a secret', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ status: 'connected' })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-manageBtn]');
      await click('[data-test-orgIntegrations-jiraSecurity-regenerateBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-regenerateWarning]')
        .hasText(t('jiraSecurity.regenerateWarning'));
    });

    test('it warns before disconnecting', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ status: 'connected' })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await click('[data-test-org-integration-card-manageBtn]');
      await click('[data-test-orgIntegrations-jiraSecurity-disconnectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-disconnectWarning]')
        .hasText(t('jiraSecurity.disconnectWarning'));
    });
  }
);
