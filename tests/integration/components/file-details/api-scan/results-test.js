import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { setupKnoxiqScanStatusMirage } from 'irene/tests/helpers/knoxiq-test-utils';

const API_TABLE_CASES = [
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
  'Integration | Component | file-details/api-scan/results',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      setupFileModelEndpoints(this.server);
      this.server.createList('organization', 1);

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

    test.each(
      'shows the correct vulnerability table based on KnoxIQ API scan status',
      API_TABLE_CASES,
      async function (assert, [apiStatus, tableType]) {
        const vulnerability = this.server.create('vulnerability', {
          name: 'Test API Vulnerability',
          types: [ENUMS.VULNERABILITY_TYPE.API],
        });

        this.server.create('analysis-overview', {
          file: this.file.id,
          vulnerability: vulnerability.id,
          status: ENUMS.ANALYSIS_STATUS.COMPLETED,
          computed_risk: ENUMS.RISK.HIGH,
          exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH,
        });

        setupKnoxiqScanStatusMirage(this.server, {
          sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          api: apiStatus,
        });

        await render(
          hbs`<FileDetails::ApiScan::Results @file={{this.file}} />`
        );

        await assertVulnerabilityTableType(assert, tableType);
      }
    );
  }
);
