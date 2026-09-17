import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, settled } from '@ember/test-helpers';
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

    test('it shows the not-connected state', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.notConnected'));

      // The secret is only useful once we can send the admin to the page that
      // consumes it, so it waits for a site address.
      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-generateBtn]')
        .isDisabled();

      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

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

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-status]')
        .hasText(t('jiraSecurity.connected'));

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-disconnectBtn]')
        .exists();

      // The API sends an ISO timestamp; nobody reads one.
      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-connectedOn]')
        .doesNotIncludeText('2026-09-15T08:00:00Z')
        .includesText('Sep 15, 2026');

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
      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secret]')
        .hasValue('a-very-long-generated-shared-secret-value');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secretWarning]')
        .hasText(t('jiraSecurity.secretShownOnce'));
    });

    test('it rejects a site address that is not a Jira site', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

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
      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

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

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-manualSteps]')
        .hasText(t('jiraSecurity.manualSteps'));

      // A button that can never be enabled is noise beside the instructions.
      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-continueBtn]')
        .doesNotExist();
    });

    test('it offers the install step while setting up', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);

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

      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-continueBtn]')
        .doesNotExist();
    });

    test('it confirms the copy on the control that was clicked', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse()
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);

      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-copiedIcon]')
        .doesNotExist();

      // Headless Chrome denies clipboard writes, and a failed copy deliberately
      // does not claim success.
      const clipboard = navigator.clipboard;

      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.resolve() },
        configurable: true,
      });

      try {
        await click('[data-test-orgIntegrations-jiraSecurity-copyBtn]');
      } finally {
        Object.defineProperty(navigator, 'clipboard', {
          value: clipboard,
          configurable: true,
        });
      }

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-copiedIcon]')
        .exists('the tick answers the click that produced it');
    });

    test('it drops the secret once Jira confirms the connection', async function (assert) {
      // The admin returns from Jira and the panel refreshes on window focus. By
      // then the secret is spent -- still showing it invites a pointless copy
      // and keeps a live credential on screen.
      let status = 'not_connected';

      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({
          status,
          connected_on: status === 'connected' ? '2026-09-22T10:00:00Z' : null,
        })
      );

      this.server.post('/organizations/:id/jira_security', () => ({
        secret: 'a-very-long-generated-shared-secret-value',
      }));

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
      await fillIn(
        '[data-test-orgIntegrations-jiraSecurity-siteInput]',
        'acme.atlassian.net'
      );

      await click('[data-test-orgIntegrations-jiraSecurity-generateBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secret]')
        .exists('secret is shown while setup is still in progress');

      // Jira confirms while the admin is away in the other tab.
      status = 'connected';

      window.dispatchEvent(new Event('focus'));
      await settled();

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-secret]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-connectedOn]')
        .exists();
    });

    test('it warns before regenerating a secret', async function (assert) {
      this.server.get('/organizations/:id/jira_security', () =>
        statusResponse({ status: 'connected' })
      );

      await render(hbs`<Organization::Integrations::JiraSecurity />`);
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
      await click('[data-test-orgIntegrations-jiraSecurity-disconnectBtn]');

      assert
        .dom('[data-test-orgIntegrations-jiraSecurity-disconnectWarning]')
        .hasText(t('jiraSecurity.disconnectWarning'));
    });
  }
);
