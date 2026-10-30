import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
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
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::ApiScanAutomation::Settings @profileId={{this.profileId}} />
`;

const PREFERENCE_URL = '/profiles/:id/apiscanautomation_preference';

const DEFAULT_OPTIONS = {
  id: '1',
  api_scan_automation_enabled: false,
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
      server.get(PREFERENCE_URL, () => ({
        ...DEFAULT_OPTIONS,
        ...overrides,
      }));
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    test('it does not request preferences without a profile id', async function (assert) {
      let requestCount = 0;

      this.server.get(PREFERENCE_URL, () => {
        requestCount += 1;

        return DEFAULT_OPTIONS;
      });

      this.set('profileId', undefined);

      await render(TEMPLATE);

      assert.strictEqual(requestCount, 0);
      assert.dom(selectors.toggleInput).isNotChecked().isDisabled();
    });

    test('renders the panel with automation disabled by default', async function (assert) {
      stubGet(this.server);

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.title).containsText(t('apiScanAutomation.title'));
      assert.dom(selectors.toggleInput).isNotChecked();
      assert.dom(selectors.saveBtn).doesNotExist();
      assert.dom('[data-test-apiScanAutomation-scanAllWarning]').doesNotExist();
    });

    test('shows the enabled toggle without a scan-all warning', async function (assert) {
      stubGet(this.server, { api_scan_automation_enabled: true });

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();
      assert.dom('[data-test-apiScanAutomation-scanAllWarning]').doesNotExist();
    });

    // ─── Saving ──────────────────────────────────────────────────────────────

    test('saves when the toggle changes', async function (assert) {
      assert.expect(3);

      stubGet(this.server);

      this.server.put(PREFERENCE_URL, (_, req) => {
        const body = JSON.parse(req.requestBody);

        assert.true(body.api_scan_automation_enabled);

        return { ...DEFAULT_OPTIONS, ...body };
      });

      await render(TEMPLATE);

      await click(selectors.toggleInput);

      const notify = this.owner.lookup('service:notifications');

      assert.dom(selectors.toggleInput).isChecked();
      assert.strictEqual(
        notify.successMsg,
        t('apiScanAutomation.settingsUpdated')
      );
    });

    test('surfaces a save failure and restores the toggle', async function (assert) {
      stubGet(this.server);

      let handlerCalled = false;

      this.server.put(PREFERENCE_URL, () => {
        handlerCalled = true;

        return new Response(400, {}, { detail: 'Could not save settings' });
      });

      await render(TEMPLATE);

      await click(selectors.toggleInput);

      const notify = this.owner.lookup('service:notifications');

      assert.true(handlerCalled, 'the save request reached the server');
      assert.dom(selectors.toggleInput).isNotChecked();
      assert.strictEqual(
        notify.errorMsg,
        'Could not save settings',
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
