import { click, find, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import {
  disableKnoxiqForTests,
  enableKnoxiqForTests,
  KNOXIQ_CARD_ACCENT_CSS_VAR,
  setupFileExploitabilityMirageEndpoint,
  setupKnoxiqMirageEndpoints,
} from 'irene/tests/helpers/knoxiq-test-utils';

const KNOXIQ_ACCENT_STATUS_CASES = [
  [ENUMS.KNOXIQ_SCAN_STATUS.LEGACY, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED, 'done'],
  [ENUMS.KNOXIQ_SCAN_STATUS.RUNNING, 'pending'],
  [ENUMS.KNOXIQ_SCAN_STATUS.PENDING, 'pending'],
];

function cardAccentUsesColor(accent) {
  const card = find('[data-test-knoxiq-project-card]');
  const accentBar = card?.querySelector(':scope > div');

  return accentBar
    ?.getAttribute('style')
    ?.includes(KNOXIQ_CARD_ACCENT_CSS_VAR[accent]);
}

module('Integration | Component | app-file-card', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    setupFileModelEndpoints(this.server);

    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => ({
      id: req.params.id,
      status: true,
    }));

    this.server.get('/v3/projects/:id', (schema, req) =>
      schema.projects.find(req.params.id)?.toJSON()
    );

    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    const store = this.owner.lookup('service:store');
    const project = this.server.create('project');
    const profile = this.server.create('profile');
    const file = this.server.create('file', { project: project.id });

    this.server.createList('vulnerability', 3).forEach((vulnerability) => {
      this.server.create('analysis', {
        file: file.id,
        vulnerability: vulnerability.id,
        status: ENUMS.ANALYSIS_STATUS.COMPLETED,
      });
    });

    this.file = store.push(
      store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
        profile: profile.id,
      })
    );

    this.file.set('project', store.peekRecord('project', project.id));
  });

  test('it renders legacy FileOverview when KnoxIQ is disabled', async function (assert) {
    disableKnoxiqForTests(this);

    await render(
      hbs`<AppFileCard @file={{this.file}} @showCheckbox={{true}} />`
    );

    assert.dom('[data-test-fileOverview-root]').exists();
    assert.dom('[data-test-knoxiq-project-card]').doesNotExist();
    assert.dom('[data-test-fileOverview-fileName]').hasText(this.file.name);
  });

  module('when KnoxIQ is enabled', function (nestedHooks) {
    nestedHooks.beforeEach(function () {
      enableKnoxiqForTests(this);
      setupKnoxiqMirageEndpoints(this.server);
    });

    test('it renders KnoxIQ project card instead of FileOverview', async function (assert) {
      this.file.knoxiqStatus = ENUMS.KNOXIQ_SCAN_STATUS.LEGACY;

      await render(
        hbs`<AppFileCard @file={{this.file}} @showCheckbox={{true}} />`
      );

      assert.dom('[data-test-knoxiq-project-card]').exists();
      assert.dom('[data-test-fileOverview-root]').doesNotExist();
      assert
        .dom('[data-test-knoxiq-project-card-fileName]')
        .hasText(this.file.name);
    });

    test.each(
      'it applies card accent color from KnoxIQ scan status',
      KNOXIQ_ACCENT_STATUS_CASES,
      async function (assert, [knoxiqStatus, accent]) {
        this.file.knoxiqStatus = knoxiqStatus;

        setupFileExploitabilityMirageEndpoint(this.server, {
          exploitability_count_high: 0,
          exploitability_count_medium: 0,
          exploitability_count_low: 0,
          exploitability_count_passed: 0,
          exploitability_count_unknown: 0,
        });

        await render(hbs`<AppFileCard @file={{this.file}} />`);

        assert.ok(
          cardAccentUsesColor(accent),
          `accent bar uses ${accent} color`
        );
      }
    );

    test('it renders legacy card layout without exploitability section', async function (assert) {
      this.file.knoxiqStatus = ENUMS.KNOXIQ_SCAN_STATUS.LEGACY;

      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: 5,
        exploitability_count_medium: 2,
        exploitability_count_low: 1,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      await render(hbs`<AppFileCard @file={{this.file}} />`);

      await waitFor('[data-test-fileChartSeverityLevel-chart]', {
        timeout: 5000,
      });

      assert.dom('[data-test-fileChartSeverityLevel-chart]').exists();
      assert
        .dom('[data-test-knoxiq-project-card-exploitabilitySection]')
        .doesNotExist();
      assert
        .dom('[data-test-knoxiq-project-card-severitySection]')
        .doesNotExist();
    });

    test('it renders Knox card layout with exploitability counts when scan has data', async function (assert) {
      const highCount = 4;
      const mediumCount = 2;
      const lowCount = 7;

      this.file.knoxiqStatus = ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED;

      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: highCount,
        exploitability_count_medium: mediumCount,
        exploitability_count_low: lowCount,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      await render(hbs`<AppFileCard @file={{this.file}} />`);

      await waitFor('[data-test-knoxiq-project-card-exploitabilitySection]', {
        timeout: 5000,
      });

      assert.dom('[data-test-fileChartSeverityLevel-chart]').doesNotExist();
      assert
        .dom('[data-test-knoxiq-project-card-exploitabilitySection]')
        .exists();
      assert.dom('[data-test-knoxiq-project-card-severitySection]').exists();

      assert
        .dom('[data-test-knoxiq-project-card-exploitability-high]')
        .includesText(String(highCount).padStart(2, '0'));
      assert
        .dom('[data-test-knoxiq-project-card-exploitability-medium]')
        .includesText(String(mediumCount).padStart(2, '0'));
      assert
        .dom('[data-test-knoxiq-project-card-exploitability-low]')
        .includesText(String(lowCount).padStart(2, '0'));

      assert.ok(cardAccentUsesColor('done'));
    });

    test('it shows FileChart for not-triggered files without exploitability data', async function (assert) {
      this.file.knoxiqStatus = ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED;

      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: 0,
        exploitability_count_medium: 0,
        exploitability_count_low: 0,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      await render(hbs`<AppFileCard @file={{this.file}} />`);

      await waitFor('[data-test-fileChartSeverityLevel-chart]', {
        timeout: 5000,
      });

      assert
        .dom('[data-test-knoxiq-project-card-exploitabilitySection]')
        .doesNotExist();
      assert.ok(cardAccentUsesColor('pending'));
    });

    test('it shows Run KnoxIQ button and triggers scan on click', async function (assert) {
      this.file.knoxiqStatus = ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED;
      this.file.isKnoxiqAutomated = false;

      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: 0,
        exploitability_count_medium: 0,
        exploitability_count_low: 0,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      let scanTriggered = false;
      let scannedFileId = null;

      this.server.post('/knoxiq/file/:fileId/knoxiq_scan', (_, req) => {
        scanTriggered = true;
        scannedFileId = req.params.fileId;

        return {};
      });

      await render(hbs`<AppFileCard @file={{this.file}} />`);

      assert.dom('[data-test-knoxiq-project-card-runKnoxIqBtn]').exists();
      assert
        .dom('[data-test-knoxiq-project-card-runKnoxIqBtn]')
        .hasText(t('knoxIq.runKnoxIq'));

      await click('[data-test-knoxiq-project-card-runKnoxIqBtn]');

      assert.true(scanTriggered);
      assert.strictEqual(scannedFileId, this.file.id);
    });
  });
});
