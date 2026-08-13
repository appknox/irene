import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

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

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  root: '[data-test-projectSettings-apiScanAutomation-root]',
  title: '[data-test-apiScanAutomation-title]',
  toggleInput: '[data-test-apiScanAutomation-toggle] [data-test-toggle-input]',
  saveBtn: '[data-test-apiScanAutomation-saveBtn]',
  scanAllWarning: '[data-test-apiScanAutomation-scanAllWarning]',
  list: (id) => `[data-test-apiScanAutomation-ruleList='${id}']`,
  listInput: (id) =>
    `[data-test-apiScanAutomation-ruleList='${id}'] [data-test-apiScanAutomation-ruleList-input]`,
  listAddBtn: (id) =>
    `[data-test-apiScanAutomation-ruleList='${id}'] [data-test-apiScanAutomation-ruleList-addBtn]`,
  listChips: (id) =>
    `[data-test-apiScanAutomation-ruleList='${id}'] [data-test-apiScanAutomation-ruleList-chip]`,
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::ApiScanAutomation::Settings @profileId={{this.profileId}} />
`;

const DEFAULT_OPTIONS = {
  id: '1',
  ds_api_capture_filters: [],
  api_scan_automation_enabled: false,
  api_scan_automation_included_domains: [],
  api_scan_automation_excluded_domains: [],
  api_scan_automation_excluded_endpoints: [],
};

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/api-scan-automation/settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.setProperties({ profileId: '1' });
    });

    const stubGet = (server, overrides = {}) => {
      server.get('/profiles/:id/api_scan_options', () => ({
        ...DEFAULT_OPTIONS,
        ...overrides,
      }));
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    test('renders the panel with automation disabled by default', async function (assert) {
      stubGet(this.server);

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.title).containsText(t('apiScanAutomation.title'));
      assert.dom(selectors.toggleInput).isNotChecked();

      // Scope lists are only relevant once automation is on.
      assert.dom(selectors.list('includedDomains')).doesNotExist();
      assert.dom(selectors.list('excludedDomains')).doesNotExist();
      assert.dom(selectors.list('excludedEndpoints')).doesNotExist();
    });

    test('shows the saved scope when automation is enabled', async function (assert) {
      stubGet(this.server, {
        api_scan_automation_enabled: true,
        api_scan_automation_included_domains: ['api.example.com'],
        api_scan_automation_excluded_domains: ['analytics.vendor.com'],
        api_scan_automation_excluded_endpoints: ['/admin/*'],
      });

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();
      assert
        .dom(selectors.listChips('includedDomains'))
        .containsText('api.example.com');
      assert
        .dom(selectors.listChips('excludedDomains'))
        .containsText('analytics.vendor.com');
      assert
        .dom(selectors.listChips('excludedEndpoints'))
        .containsText('/admin/*');
    });

    // ─── Scope warning ───────────────────────────────────────────────────────

    test('warns that every captured host is scanned when no domains are included', async function (assert) {
      stubGet(this.server, { api_scan_automation_enabled: true });

      await render(TEMPLATE);

      assert.dom(selectors.scanAllWarning).exists();
    });

    test('hides the warning once a domain is included', async function (assert) {
      stubGet(this.server, {
        api_scan_automation_enabled: true,
        api_scan_automation_included_domains: ['api.example.com'],
      });

      await render(TEMPLATE);

      assert.dom(selectors.scanAllWarning).doesNotExist();
    });

    // ─── Adding and removing entries ─────────────────────────────────────────

    test('adds a domain to the included list', async function (assert) {
      stubGet(this.server, { api_scan_automation_enabled: true });

      await render(TEMPLATE);

      await fillIn(selectors.listInput('includedDomains'), 'api.example.com');
      await click(selectors.listAddBtn('includedDomains'));

      assert.dom(selectors.listChips('includedDomains')).exists({ count: 1 });
      assert
        .dom(selectors.listChips('includedDomains'))
        .containsText('api.example.com');
    });

    test('removes a domain from the included list', async function (assert) {
      stubGet(this.server, {
        api_scan_automation_enabled: true,
        api_scan_automation_included_domains: ['api.example.com'],
      });

      await render(TEMPLATE);

      assert.dom(selectors.listChips('includedDomains')).exists({ count: 1 });

      await click(
        `${selectors.listChips('includedDomains')} [data-test-chip-delete-btn]`
      );

      assert.dom(selectors.listChips('includedDomains')).doesNotExist();
    });

    // ─── Validation ──────────────────────────────────────────────────────────

    test('rejects a URL where a host name is expected', async function (assert) {
      stubGet(this.server, { api_scan_automation_enabled: true });

      await render(TEMPLATE);

      await fillIn(
        selectors.listInput('includedDomains'),
        'https://api.example.com/v1'
      );
      await click(selectors.listAddBtn('includedDomains'));

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        t('apiScanAutomation.invalidDomain', {
          domain: 'https://api.example.com/v1',
        })
      );

      assert.dom(selectors.listChips('includedDomains')).doesNotExist();
    });

    test('rejects an endpoint that does not start with a slash', async function (assert) {
      stubGet(this.server, { api_scan_automation_enabled: true });

      await render(TEMPLATE);

      await fillIn(selectors.listInput('excludedEndpoints'), 'admin');
      await click(selectors.listAddBtn('excludedEndpoints'));

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        t('apiScanAutomation.invalidEndpoint', { path: 'admin' })
      );
    });

    test('rejects a duplicate entry', async function (assert) {
      stubGet(this.server, {
        api_scan_automation_enabled: true,
        api_scan_automation_included_domains: ['api.example.com'],
      });

      await render(TEMPLATE);

      await fillIn(selectors.listInput('includedDomains'), 'api.example.com');
      await click(selectors.listAddBtn('includedDomains'));

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, t('apiScanAutomation.duplicateRule'));
      assert.dom(selectors.listChips('includedDomains')).exists({ count: 1 });
    });

    test('rejects an empty entry', async function (assert) {
      stubGet(this.server, { api_scan_automation_enabled: true });

      await render(TEMPLATE);

      await click(selectors.listAddBtn('includedDomains'));

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, t('apiScanAutomation.emptyRule'));
    });

    // ─── Saving ──────────────────────────────────────────────────────────────

    test('saves the enabled flag and every scope list', async function (assert) {
      assert.expect(5);

      stubGet(this.server);

      this.server.put('/profiles/:id/api_scan_options', (_, req) => {
        const body = JSON.parse(req.requestBody);

        assert.true(body.api_scan_automation_enabled);

        assert.deepEqual(body.api_scan_automation_included_domains, [
          'api.example.com',
        ]);

        assert.deepEqual(body.api_scan_automation_excluded_domains, []);

        assert.deepEqual(body.api_scan_automation_excluded_endpoints, [
          '/admin/*',
        ]);

        return { ...DEFAULT_OPTIONS, ...body };
      });

      await render(TEMPLATE);

      await click(selectors.toggleInput);

      await fillIn(selectors.listInput('includedDomains'), 'api.example.com');
      await click(selectors.listAddBtn('includedDomains'));

      await fillIn(selectors.listInput('excludedEndpoints'), '/admin/*');
      await click(selectors.listAddBtn('excludedEndpoints'));

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('apiScanAutomation.settingsUpdated')
      );
    });

    test('surfaces a save failure', async function (assert) {
      stubGet(this.server);

      let handlerCalled = false;

      this.server.put('/profiles/:id/api_scan_options', () => {
        handlerCalled = true;

        return new Response(400, {}, { detail: 'Scope rules are invalid' });
      });

      await render(TEMPLATE);

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.true(handlerCalled, 'the save request reached the server');
      assert.strictEqual(
        notify.errorMsg,
        'Scope rules are invalid',
        'the server message is surfaced'
      );
      assert.strictEqual(
        notify.successMsg,
        null,
        'no success notification is shown'
      );
    });
  }
);
