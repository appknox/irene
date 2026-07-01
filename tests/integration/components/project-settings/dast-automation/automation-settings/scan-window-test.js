import {
  fillIn,
  render,
  settled,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import { Response } from 'miragejs';
import { getTimeZones } from '@vvo/tzdb';

import styles from 'irene/components/ak-select/index.scss';
import { chooseAkSelectOption } from 'irene/tests/helpers/mirage-utils';

const PROFILE_ID = '1';
const TRIGGER = styles['ak-select-trigger'];
const SCAN_WINDOW_URL = '/v2/profiles/:id/ds_automated_scan_window_preference';

const SEL = {
  root: '[data-test-projectSettings-dastAutomationSettings-scanWindow-root]',
  label: '[data-test-projectSettings-dastAutomationSettings-scanWindowLabel]',

  skeleton:
    '[data-test-projectSettings-dastAutomationSettings-scanWindow-skeleton]',

  typeSelect:
    '[data-test-projectSettings-dastAutomationSettings-scanWindowTypeSelect]',

  timeRange:
    '[data-test-projectSettings-dastAutomationSettings-scanWindow-timeRange]',

  startAt:
    '[data-test-projectSettings-dastAutomationSettings-scanWindowStartAt]',

  endBefore:
    '[data-test-projectSettings-dastAutomationSettings-scanWindowEndBefore]',

  timezone:
    '[data-test-projectSettings-dastAutomationSettings-scanWindowTimezone]',
};

const TYPE_KEY = {
  anytime: 'dastAutomation.scanWindowAnytime',
  specificTime: 'dastAutomation.scanWindowSpecificTime',
};

// The empty window the "anytime" variant carries before any window is set.
const EMPTY_WINDOW = {
  scan_window_type: 'anytime',
  scan_window_start_at: null,
  scan_window_end_before: null,
  scan_window_timezone: '',
};

// Defaults the component seeds the first time "Specific Time" is picked.
const DEFAULTS = { start: '09:00', end: '18:00', timezone: 'Europe/London' };

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }
}

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScanWindow
    @profileId={{this.profileId}}
  />
`;

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scan-window',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.notify = this.owner.lookup('service:notifications');

      this.preference = this.server.create(
        'ds-automated-scan-window-preference',
        { id: PROFILE_ID }
      );

      // The component reads/writes a single preference for the profile.
      this.server.get(SCAN_WINDOW_URL, (schema) =>
        schema.dsAutomatedScanWindowPreferences.find(PROFILE_ID)?.toJSON()
      );

      // Default save handler captures the body; the failure test overrides it.
      this.server.put(SCAN_WINDOW_URL, (schema, req) => {
        this.set('requestBody', JSON.parse(req.requestBody));

        return schema.dsAutomatedScanWindowPreferences
          .find(PROFILE_ID)
          .update(this.requestBody)
          .toJSON();
      });

      this.setProperties({ profileId: PROFILE_ID });
    });

    // ─── Loading ──────────────────────────────────────────────────────────────

    test('shows the skeleton loader while the preference loads, then the content', async function (assert) {
      this.server.get(
        SCAN_WINDOW_URL,
        (schema) =>
          schema.dsAutomatedScanWindowPreferences.find(PROFILE_ID)?.toJSON(),
        { timing: 500 }
      );

      // Render without awaiting so we can observe the in-flight skeleton.
      render(TEMPLATE);

      await waitFor(SEL.skeleton, { timeout: 500 });

      assert.dom(SEL.skeleton).exists('skeleton shown while loading');
      assert.dom(SEL.root).doesNotExist('content hidden while loading');

      await settled();

      assert.dom(SEL.skeleton).doesNotExist('skeleton gone after load');
      assert.dom(SEL.root).exists('content shown after load');
    });

    test('renders nothing when no profileId is provided', async function (assert) {
      this.set('profileId', undefined);

      await render(TEMPLATE);

      assert.dom(SEL.skeleton).doesNotExist();
      assert.dom(SEL.root).doesNotExist();
    });

    // ─── Rendering by type ──────────────────────────────────────────────────────

    test('renders the type select and hides the time inputs for "anytime"', async function (assert) {
      this.preference.update(EMPTY_WINDOW);

      await render(TEMPLATE);

      assert.dom(SEL.root).exists();
      assert.dom(SEL.label).hasText(t('dastAutomation.scanWindow'));
      assert.dom(`${SEL.typeSelect} .${TRIGGER}`).hasText(t(TYPE_KEY.anytime));
      assert.dom(SEL.timeRange).doesNotExist();
      assert.dom(SEL.timezone).doesNotExist();
    });

    test('renders the time-range and timezone sub-components for "specific_time"', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(`${SEL.typeSelect} .${TRIGGER}`)
        .hasText(t(TYPE_KEY.specificTime));

      assert.dom(SEL.timeRange).exists();
      assert.dom(SEL.timezone).exists();
    });

    // ─── Switching type ──────────────────────────────────────────────────────────

    test('switching to "Specific Time" seeds defaults, saves, and reveals the inputs', async function (assert) {
      this.preference.update(EMPTY_WINDOW);

      await render(TEMPLATE);

      assert.dom(SEL.timeRange).doesNotExist('inputs hidden before the switch');

      await chooseAkSelectOption({
        selectTriggerClass: SEL.typeSelect,
        labelToSelect: t(TYPE_KEY.specificTime),
      });

      assert.strictEqual(
        this.requestBody.scan_window_type,
        'specific_time',
        'persists the new type'
      );

      assert.strictEqual(this.requestBody.scan_window_start_at, DEFAULTS.start);
      assert.strictEqual(this.requestBody.scan_window_end_before, DEFAULTS.end);

      assert.strictEqual(
        this.requestBody.scan_window_timezone,
        DEFAULTS.timezone
      );

      assert.strictEqual(
        this.notify.successMsg,
        t('dastAutomation.scanWindowUpdated')
      );

      assert.dom(SEL.timeRange).exists('inputs revealed after the switch');
      assert.dom(SEL.timezone).exists();
    });

    test('default values are rendered in the inputs after switching to "Specific Time"', async function (assert) {
      this.preference.update(EMPTY_WINDOW);

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: SEL.typeSelect,
        labelToSelect: t(TYPE_KEY.specificTime),
      });

      assert.dom(SEL.startAt).hasValue(DEFAULTS.start);
      assert.dom(SEL.endBefore).hasValue(DEFAULTS.end);

      // The timezone trigger label contains the city name regardless of DST offset.
      assert
        .dom(`${SEL.timezone} .${TRIGGER}`)
        .includesText('London', 'default timezone shown in select');
    });

    test('switching back to "Any Time" saves and hides the inputs', async function (assert) {
      // Factory default is "specific_time".
      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: SEL.typeSelect,
        labelToSelect: t(TYPE_KEY.anytime),
      });

      assert.strictEqual(this.requestBody.scan_window_type, 'anytime');

      assert.strictEqual(
        this.requestBody.scan_window_start_at,
        null,
        'start time cleared'
      );

      assert.strictEqual(
        this.requestBody.scan_window_end_before,
        null,
        'end time cleared'
      );

      assert.strictEqual(
        this.requestBody.scan_window_timezone,
        '',
        'timezone cleared'
      );

      assert.strictEqual(
        this.notify.successMsg,
        t('dastAutomation.scanWindowUpdated')
      );

      assert.dom(SEL.timeRange).doesNotExist();
      assert.dom(SEL.timezone).doesNotExist();
    });

    test('re-selecting the current type does not trigger a save', async function (assert) {
      this.preference.update(EMPTY_WINDOW);

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: SEL.typeSelect,
        labelToSelect: t(TYPE_KEY.anytime),
      });

      assert.strictEqual(this.requestBody, undefined, 'no PUT was made');
      assert.strictEqual(this.notify.successMsg, null, 'no success notice');
    });

    // ─── Error handling ────────────────────────────────────────────────────────

    test('notifies and renders nothing when the preference fails to load', async function (assert) {
      this.server.get(SCAN_WINDOW_URL, () => new Response(500, {}, {}));

      await render(TEMPLATE);

      assert.strictEqual(
        this.notify.errorMsg,
        'The backend responded with an error'
      );

      assert.dom(SEL.root).doesNotExist();
    });

    test('rolls back to "Any Time" and notifies when switching to specific_time fails', async function (assert) {
      this.preference.update(EMPTY_WINDOW);

      this.server.put(SCAN_WINDOW_URL, () => new Response(500, {}, {}));

      await render(TEMPLATE);

      // Confirm initial anytime state before the switch attempt.
      assert
        .dom(`${SEL.typeSelect} .${TRIGGER}`)
        .hasText(t(TYPE_KEY.anytime), 'initial type is anytime');

      assert.dom(SEL.timeRange).doesNotExist('inputs hidden before the switch');

      assert
        .dom(SEL.timezone)
        .doesNotExist('timezone hidden before the switch');

      await chooseAkSelectOption({
        selectTriggerClass: SEL.typeSelect,
        labelToSelect: t(TYPE_KEY.specificTime),
      });

      assert.strictEqual(
        this.notify.errorMsg,
        'The backend responded with an error'
      );

      // rollbackAttributes() must restore the anytime state unchanged.
      assert
        .dom(`${SEL.typeSelect} .${TRIGGER}`)
        .hasText(t(TYPE_KEY.anytime), 'type reverts after a failed save');

      assert
        .dom(SEL.timeRange)
        .doesNotExist('inputs stay hidden after a failed save');

      assert
        .dom(SEL.timezone)
        .doesNotExist('timezone stays hidden after a failed save');
    });

    test('rolls back to "Specific Time" and keeps the inputs when switching to anytime fails', async function (assert) {
      // Capture factory-seeded values before anything mutates them.
      const originalStart = this.preference.scan_window_start_at;
      const originalEnd = this.preference.scan_window_end_before;

      this.server.put(SCAN_WINDOW_URL, () => new Response(500, {}, {}));

      await render(TEMPLATE);

      // Confirm factory values are visible before the switch attempt.
      assert.dom(SEL.startAt).hasValue(originalStart, 'initial start shown');
      assert.dom(SEL.endBefore).hasValue(originalEnd, 'initial end shown');

      await chooseAkSelectOption({
        selectTriggerClass: SEL.typeSelect,
        labelToSelect: t(TYPE_KEY.anytime),
      });

      assert.strictEqual(
        this.notify.errorMsg,
        'The backend responded with an error'
      );

      // rollbackAttributes() must restore all original specific_time values.
      assert
        .dom(`${SEL.typeSelect} .${TRIGGER}`)
        .hasText(t(TYPE_KEY.specificTime), 'type reverts after a failed save');

      assert
        .dom(SEL.timeRange)
        .exists('inputs stay visible after a failed save');

      assert.dom(SEL.startAt).hasValue(originalStart, 'start time unchanged');
      assert.dom(SEL.endBefore).hasValue(originalEnd, 'end time unchanged');
    });

    // ─── Saving on sub-component edits ───────────────────────────────────────────

    test('saves and notifies when the start time changes', async function (assert) {
      // Factory default is "specific_time", so the time inputs are visible.
      await render(TEMPLATE);

      await fillIn(SEL.startAt, '10:30');

      // A typed change saves on a debounce, so wait for the save to land.
      await waitUntil(() => this.notify.successMsg, { timeout: 2000 });

      assert.strictEqual(this.requestBody.scan_window_type, 'specific_time');
      assert.strictEqual(this.requestBody.scan_window_start_at, '10:30');

      assert.strictEqual(
        this.notify.successMsg,
        t('dastAutomation.scanWindowUpdated')
      );
    });

    test('saves and notifies when the end time changes', async function (assert) {
      await render(TEMPLATE);

      await fillIn(SEL.endBefore, '21:45');

      await waitUntil(() => this.notify.successMsg, { timeout: 2000 });

      assert.strictEqual(this.requestBody.scan_window_type, 'specific_time');
      assert.strictEqual(this.requestBody.scan_window_end_before, '21:45');

      assert.strictEqual(
        this.notify.successMsg,
        t('dastAutomation.scanWindowUpdated')
      );
    });

    test('saves and notifies when the timezone changes', async function (assert) {
      await render(TEMPLATE);

      // The timezone list is the full IANA set sorted by current offset;
      // derive the expected value from the same source the component uses.
      const expectedTz = getTimeZones()[0].name;

      await chooseAkSelectOption({
        selectTriggerClass: SEL.timezone,
        optionIndex: 0,
      });

      assert.strictEqual(this.requestBody.scan_window_type, 'specific_time');

      assert.strictEqual(
        this.requestBody.scan_window_timezone,
        expectedTz,
        'persists the chosen timezone'
      );

      assert.strictEqual(
        this.notify.successMsg,
        t('dastAutomation.scanWindowUpdated')
      );
    });
  }
);
