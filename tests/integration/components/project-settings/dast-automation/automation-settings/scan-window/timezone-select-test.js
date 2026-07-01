import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import { render } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { getTimeZones } from '@vvo/tzdb';

import styles from 'irene/components/ak-select/index.scss';
import { chooseAkSelectOption } from 'irene/tests/helpers/mirage-utils';

const PROFILE_ID = '1';
const TRIGGER = styles['ak-select-trigger'];

const SEL = {
  root: '[data-test-projectSettings-dastAutomationSettings-scanWindowTimezone]',
};

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScanWindow::TimezoneSelect
    @preference={{this.preference}}
    @onSave={{this.onSave}}
    @disabled={{this.disabled}}
  />
`;

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scan-window/timezone-select',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const record = this.server.create('ds-automated-scan-window-preference', {
        id: PROFILE_ID,
        scan_window_timezone: 'Europe/London',
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

    test('renders the timezone label', async function (assert) {
      await render(TEMPLATE);

      // The label is a sibling of the AkSelect in the outer wrapper, so check
      // the full rendered output rather than the AkSelect root.
      assert
        .dom(this.element)
        .includesText(t('dastAutomation.scanWindowTimezone'));
    });

    test('shows the current preference timezone in the select trigger', async function (assert) {
      await render(TEMPLATE);

      // Europe/London label always includes "London" regardless of DST offset.
      assert
        .dom(`${SEL.root} .${TRIGGER}`)
        .includesText('London', 'current timezone shown in trigger');
    });

    test('disables the select when @disabled is true', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert
        .dom(`${SEL.root} .${TRIGGER}`)
        .hasAria('disabled', 'true', 'trigger is disabled');
    });

    // ─── Save behaviour ───────────────────────────────────────────────────────

    test('updates the preference and calls @onSave immediately when a timezone is selected', async function (assert) {
      await render(TEMPLATE);

      // Derive the expected value from the same source the component uses.
      const expectedTz = getTimeZones()[0].name;

      await chooseAkSelectOption({
        selectTriggerClass: SEL.root,
        optionIndex: 0,
      });

      assert.strictEqual(this.preference.scanWindowTimezone, expectedTz);

      assert.ok(this.onSaveCalled, '@onSave was called');
    });
  }
);
