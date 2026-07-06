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
  root: '[data-test-projectSettings-dastAutomationSettings-configuration-root]',
  header:
    '[data-test-projectSettings-dastAutomationSettings-configurationHeader]',
  toggleLabel:
    '[data-test-projectSettings-dastAutomationSettings-dynamicscanAutomationToggleLabel]',
  descNote:
    '[data-test-projectSettings-dastAutomationSettings-headerInfoDescNote]',
  toggleInput:
    '[data-test-projectSettings-dastAutomationSettings-dynamicscanAutomationToggle] [data-test-toggle-input]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::Configuration
    @profileId={{this.profileId}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/configuration',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.setProperties({ profileId: '1' });
    });

    // ─── Render ──────────────────────────────────────────────────────────────

    test('renders the header, toggle label, and description', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', () => ({
        id: '1',
        dynamic_scan_automation_enabled: false,
      }));

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.header).containsText(t('configuration'));
      assert.dom(selectors.toggleLabel).containsText(t('enableAutomation'));
      assert.dom(selectors.descNote).containsText(t('dynScanAutoSchedNote'));
    });

    // ─── Toggle initial state ─────────────────────────────────────────────────

    test('toggle is unchecked when automation is disabled', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', () => ({
        id: '1',
        dynamic_scan_automation_enabled: false,
      }));

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();
    });

    test('toggle is checked when automation is enabled', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', () => ({
        id: '1',
        dynamic_scan_automation_enabled: true,
      }));

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();
    });

    // ─── Toggle interactions ──────────────────────────────────────────────────

    test('enabling automation shows scheduledAutomationSuccessOn notification', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', () => ({
        id: '1',
        dynamic_scan_automation_enabled: false,
      }));

      this.server.put('/v2/profiles/:id/automation_preference', (_, req) => {
        const body = JSON.parse(req.requestBody);

        return {
          id: '1',
          dynamic_scan_automation_enabled: body.dynamic_scan_automation_enabled,
        };
      });

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();

      await click(selectors.toggleInput);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('scheduledAutomationSuccessOn'),
        'shows the enabled success message'
      );

      assert.dom(selectors.toggleInput).isChecked();
    });

    test('disabling automation shows scheduledAutomationSuccessOff notification', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', () => ({
        id: '1',
        dynamic_scan_automation_enabled: true,
      }));

      this.server.put('/v2/profiles/:id/automation_preference', (_, req) => {
        const body = JSON.parse(req.requestBody);

        return {
          id: '1',
          dynamic_scan_automation_enabled: body.dynamic_scan_automation_enabled,
        };
      });

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();

      await click(selectors.toggleInput);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('scheduledAutomationSuccessOff'),
        'shows the disabled success message'
      );

      assert.dom(selectors.toggleInput).isNotChecked();
    });

    test('API error on toggle shows error notification and reverts toggle state', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', () => ({
        id: '1',
        dynamic_scan_automation_enabled: false,
      }));

      this.server.put(
        '/v2/profiles/:id/automation_preference',
        () => new Response(500)
      );

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();

      await click(selectors.toggleInput);

      const notify = this.owner.lookup('service:notifications');
      assert.ok(notify.errorMsg, 'shows an error notification');
      assert.dom(selectors.toggleInput).isNotChecked();
    });
  }
);
