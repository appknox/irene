import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { setupKnoxiqScanStatusMirage } from 'irene/tests/helpers/knoxiq-test-utils';

class NotificationsStub extends Service {
  error() {}
}

const SAST_TABLE_CASES = [
  [ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.RUNNING, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED, 'knox'],
];

const DAST_TABLE_CASES = [
  [ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.RUNNING, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED, 'knox'],
];

async function assertVulnerabilityTableType(assert, tableType) {
  if (tableType === 'knox') {
    await waitFor('[data-test-knoxiq-vulnerability-analysis-table]', {
      timeout: 5000,
    });

    assert.dom('[data-test-knoxiq-vulnerability-analysis-table]').exists();
    assert.dom('[data-test-vulnerability-analysis-table]').doesNotExist();
  } else {
    await waitFor('[data-test-vulnerability-analysis-table]', {
      timeout: 5000,
    });

    assert.dom('[data-test-vulnerability-analysis-table]').exists();
    assert
      .dom('[data-test-knoxiq-vulnerability-analysis-table]')
      .doesNotExist();
  }
}

module(
  'Integration | Component | file-details/knoxiq scan results',
  function (hooks) {
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
      const file = this.server.create('file', { project: '1', id: '1' });

      this.server.create('project', { last_file: file, id: '1' });

      this.file = store.push(store.normalize('file', file.toJSON()));

      await this.owner.lookup('service:organization').load();
    });

    function createAnalysisForScanType(context, scanType) {
      const vulnerability = context.server.create('vulnerability', {
        name: 'Test Vulnerability',
        types: [scanType],
      });

      context.server.create('analysis-overview', {
        file: context.file.id,
        vulnerability: vulnerability.id,
        status: ENUMS.ANALYSIS_STATUS.COMPLETED,
        computed_risk: ENUMS.RISK.HIGH,
        exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH,
      });
    }

    module('SAST results page', function () {
      test.each(
        'shows the correct vulnerability table based on KnoxIQ SAST scan status',
        SAST_TABLE_CASES,
        async function (assert, [sastStatus, tableType]) {
          createAnalysisForScanType(this, ENUMS.VULNERABILITY_TYPE.STATIC);

          setupKnoxiqScanStatusMirage(this.server, {
            sast: sastStatus,
            dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          });

          await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

          await assertVulnerabilityTableType(assert, tableType);
        }
      );
    });

    module('DAST results page', function () {
      test.each(
        'shows the correct vulnerability table based on KnoxIQ DAST scan status',
        DAST_TABLE_CASES,
        async function (assert, [dastStatus, tableType]) {
          createAnalysisForScanType(this, ENUMS.VULNERABILITY_TYPE.DYNAMIC);

          setupKnoxiqScanStatusMirage(this.server, {
            sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
            dast: dastStatus,
          });

          await render(hbs`
            <FileDetails::DynamicScan::Results::VulnerabilityDetails
              @file={{this.file}}
            />
          `);

          await assertVulnerabilityTableType(assert, tableType);
        }
      );
    });
  }
);
