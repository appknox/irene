import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import { fillIn, render, waitUntil } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';

const PROFILE_ID = '1';

const SEL = {
  root: '[data-test-projectSettings-dastAutomationSettings-scanWindow-timeRange]',

  startAt:
    '[data-test-projectSettings-dastAutomationSettings-scanWindowStartAt]',

  endBefore:
    '[data-test-projectSettings-dastAutomationSettings-scanWindowEndBefore]',
};

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScanWindow::TimeRange
    @preference={{this.preference}}
    @onSave={{this.onSave}}
    @disabled={{this.disabled}}
  />
`;

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scan-window/time-range',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const record = this.server.create('ds-automated-scan-window-preference', {
        id: PROFILE_ID,
      });

      const store = this.owner.lookup('service:store');

      this.preference = store.push(
        store.normalize('ds-automated-scan-window-preference', record.toJSON())
      );

      this.onSaveCalled = false;
      this.set('onSave', () => (this.onSaveCalled = true));
      this.setProperties({ preference: this.preference, disabled: false });
    });

    // ─── Rendering ────────────────────────────────────────────────────────────

    test('renders the start-at and end-before labels', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(SEL.root)
        .includesText(
          t('dastAutomation.scanWindowStartAt'),
          '"Start at" label present'
        );

      assert
        .dom(SEL.root)
        .includesText(
          t('dastAutomation.scanWindowEndBefore'),
          '"End before" label present'
        );
    });

    test('renders the inputs showing the loaded preference values', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.startAt).hasValue(this.preference.scanWindowStartAt);
      assert.dom(SEL.endBefore).hasValue(this.preference.scanWindowEndBefore);
    });

    test('disables both inputs when @disabled is true', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert.dom(SEL.startAt).isDisabled();
      assert.dom(SEL.endBefore).isDisabled();
    });

    // ─── Save behaviour ───────────────────────────────────────────────────────

    test('updates the preference and calls @onSave once after the debounce when start time changes', async function (assert) {
      await render(TEMPLATE);

      await fillIn(SEL.startAt, '10:30');

      await waitUntil(() => this.onSaveCalled, { timeout: 2000 });

      assert.strictEqual(this.preference.scanWindowStartAt, '10:30');
      assert.ok(this.onSaveCalled, '@onSave was called');
    });

    test('updates the preference and calls @onSave once after the debounce when end time changes', async function (assert) {
      await render(TEMPLATE);

      await fillIn(SEL.endBefore, '21:45');

      await waitUntil(() => this.onSaveCalled, { timeout: 2000 });

      assert.strictEqual(this.preference.scanWindowEndBefore, '21:45');
      assert.ok(this.onSaveCalled, '@onSave was called');
    });
  }
);
