import { click, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { setupKnoxiqScanStatusMirage } from 'irene/tests/helpers/knoxiq-test-utils';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

const SAST_TABLE_CASES = [
  [ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.RUNNING, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED, 'knox'],
];

const EMPTY_STATE_CASES = [
  [ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED, 'knox'],
  [ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED, 'legacy'],
];

async function assertVulnerabilityTableType(assert, tableType) {
  if (tableType === 'knox') {
    await waitFor('[data-test-knoxiq-vulnerability-analysis-table]', {
      timeout: 5000,
    });

    assert.dom('[data-test-knoxiq-vulnerability-analysis-table]').exists();
    assert.dom('[data-test-vulnerability-analysis-table]').doesNotExist();
    assert.dom('[data-test-knoxiq-vulnerability-analysis-row]').exists();
  } else {
    await waitFor('[data-test-vulnerability-analysis-table]', {
      timeout: 5000,
    });

    assert.dom('[data-test-vulnerability-analysis-table]').exists();
    assert
      .dom('[data-test-knoxiq-vulnerability-analysis-table]')
      .doesNotExist();
    assert.dom('[data-test-vulnerability-analysis-row]').exists();
  }
}

async function assertVulnerabilityTableEmpty(assert, tableType) {
  if (tableType === 'knox') {
    await waitFor('[data-test-knoxiq-vulnerability-analysis-empty]', {
      timeout: 5000,
    });

    assert.dom('[data-test-knoxiq-vulnerability-analysis-empty]').exists();
    assert.dom('[data-test-knoxiq-vulnerability-analysis-row]').doesNotExist();
  } else {
    await waitFor('[data-test-vulnerability-analysis-emptyTitle]', {
      timeout: 5000,
    });

    assert.dom('[data-test-vulnerability-analysis-emptyTitle]').exists();
    assert.dom('[data-test-vulnerability-analysis-row]').doesNotExist();
  }
}

module('Integration | Component | file-details/static-scan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    setupFileModelEndpoints(this.server);
    this.server.createList('organization', 1);
    this.owner.register('service:notifications', NotificationsStub);

    this.owner.lookup('service:store').unloadAll('knoxiq-scan');
    this.owner.lookup('service:store').unloadAll('analysis-overview');

    this.server.get('/v3/projects/:id', (schema, req) =>
      schema.projects.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v3/files/:id/analyses', (schema, req) => {
      const analyses = schema.analysisOverviews.where({
        file: req.params.id,
      }).models;

      return {
        count: analyses.length,
        next: null,
        previous: null,
        results: analyses,
      };
    });

    const store = this.owner.lookup('service:store');
    const file = this.server.create('file', { project: '1' });

    this.server.create('project', { last_file: file, id: '1' });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
    });

    await this.owner.lookup('service:organization').load();
  });

  test('it renders', async function (assert) {
    await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

    assert
      .dom('[data-test-fileDetails-staticscan-breadcrumbContainer]')
      .exists();

    assert
      .dom('[data-test-fileDetails-staticscan-sast-results-tab]')
      .exists()
      .containsText(t('sastResults'));

    if (this.file.staticVulnerabilityCount) {
      assert
        .dom('[data-test-fileDetails-staticscan-badge-count]')
        .exists()
        .containsText(this.file.staticVulnerabilityCount);
    }

    assert
      .dom('[data-test-fileDetails-staticscan-info]')
      .exists()
      .containsText(t('sastResultsInfo'));

    assert
      .dom(
        '[data-test-fileDetails-staticscan-tabs="vulnerability-details-tab"]'
      )
      .exists()
      .containsText(t('vulnerabilityDetails'));
  });

  test.each(
    'test restart static scan',
    [true, false],
    async function (assert, isStaticDone) {
      this.file.isActive = true;
      this.file.isStaticDone = isStaticDone;

      if (isStaticDone) {
        this.server.post('/v2/files/:id/rescan', () => {});
      }

      await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

      if (isStaticDone) {
        assert
          .dom('[data-test-fileDetails-staticscan-restartBtn]')
          .isNotDisabled();

        await click('[data-test-fileDetails-staticscan-restartBtn]');

        assert
          .dom('[data-test-ak-modal-header]')
          .hasText(t('modalCard.rescan.title'));

        assert
          .dom('[data-test-confirmbox-description]')
          .hasText(t('modalCard.rescan.description'));

        assert.dom('[data-test-confirmbox-confirmBtn]').hasText(t('yes'));

        assert.dom('[data-test-confirmbox-cancelBtn]').hasText(t('no'));

        await click('[data-test-confirmbox-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(notify.infoMsg, t('rescanInitiated'));
      } else {
        assert
          .dom('[data-test-fileDetails-staticscan-restartBtn]')
          .isDisabled();
      }
    }
  );

  test('static scan restart button should be disabled for inactive file', async function (assert) {
    this.file.isActive = false;
    this.file.isStaticDone = true;

    await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

    assert.dom('[data-test-fileDetails-staticscan-restartBtn]').isDisabled();
  });

  test.each(
    'shows the correct vulnerability table based on KnoxIQ SAST scan status',
    SAST_TABLE_CASES,
    async function (assert, [sastStatus, tableType]) {
      const vulnerability = this.server.create('vulnerability', {
        name: 'Test Vulnerability',
        types: [ENUMS.VULNERABILITY_TYPE.STATIC],
      });

      this.server.create('analysis-overview', {
        file: this.file.id,
        vulnerability: vulnerability.id,
        status: ENUMS.ANALYSIS_STATUS.COMPLETED,
        computed_risk: ENUMS.RISK.HIGH,
        exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH,
      });

      setupKnoxiqScanStatusMirage(this.server, {
        sast: sastStatus,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      });

      await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

      await assertVulnerabilityTableType(assert, tableType);
    }
  );

  test.each(
    'shows the correct empty state when there are no vulnerabilities',
    EMPTY_STATE_CASES,
    async function (assert, [sastStatus, tableType]) {
      setupKnoxiqScanStatusMirage(this.server, {
        sast: sastStatus,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      });

      await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

      await assertVulnerabilityTableEmpty(assert, tableType);
    }
  );
});
