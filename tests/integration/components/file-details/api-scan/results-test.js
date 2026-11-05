import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import {
  enableKnoxiqForTests,
  setupKnoxiqScanStatusMirage,
} from 'irene/tests/helpers/knoxiq-test-utils';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  loader: '[data-test-fileDetails-apiScanResults-loader]',
  knoxTable: '[data-test-knoxiq-vulnerability-analysis-table]',
  legacyTable: '[data-test-vulnerability-analysis-table]',
};

// ─── Template ──────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<FileDetails::ApiScan::Results @file={{this.file}} />`;

const API_TABLE_CASES = [
  [ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.PENDING, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.RUNNING, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.ERRORED, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.API_SCAN_DISABLED, 'legacy'],
  [ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED, 'knox'],
];

function createApiAnalysis(server, fileId) {
  const vulnerability = server.create('vulnerability', {
    name: 'Test API Vulnerability',
    types: [ENUMS.VULNERABILITY_TYPE.API],
  });

  return server.create('analysis-overview', {
    file: fileId,
    vulnerability: vulnerability.id,
    status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    computed_risk: ENUMS.RISK.HIGH,
    exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH,
  });
}

async function assertVulnerabilityTableType(assert, tableType) {
  if (tableType === 'knox') {
    await waitFor(selectors.knoxTable, { timeout: 5000 });

    assert.dom(selectors.knoxTable).exists();
    assert.dom(selectors.legacyTable).doesNotExist();
  } else {
    await waitFor(selectors.legacyTable, { timeout: 5000 });

    assert.dom(selectors.legacyTable).exists();
    assert.dom(selectors.knoxTable).doesNotExist();
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

      const [organization] = this.server.schema.organizations.all().models;

      if (organization) {
        this.server.create('organization-me', { id: organization.id });
      }

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
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
      const project = this.server.create('project', { id: '1' });

      store.push(store.normalize('project', project.toJSON()));

      const file = this.server.create('file', { project: project.id });

      this.setProperties({
        file: store.push(
          store.normalize('file', { ...file.toJSON(), project: project.id })
        ),
      });

      this.file.set('project', store.peekRecord('project', project.id));

      await this.owner.lookup('service:organization').load();
    });

    // ─── KnoxIQ enabled: table selection per API scan status ──────────────────
    test.each(
      'shows the correct vulnerability table based on KnoxIQ API scan status',
      API_TABLE_CASES,
      async function (assert, [apiStatus, tableType]) {
        enableKnoxiqForTests(this);
        createApiAnalysis(this.server, this.file.id);

        setupKnoxiqScanStatusMirage(this.server, {
          sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          api: apiStatus,
        });

        await render(TEMPLATE);

        await assertVulnerabilityTableType(assert, tableType);
      }
    );

    // ─── Loading state ──────────────────────────────────────────────────────
    test('shows a loader while the KnoxIQ scan fetch is in flight, then the table', async function (assert) {
      assert.expect(5);
      enableKnoxiqForTests(this);
      createApiAnalysis(this.server, this.file.id);

      this.server.get(
        '/knoxiq/file/:fileId/knoxiq_scan/status',
        (_, req) => ({
          id: req.params.fileId,
          sast_status: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          dast_status: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
          api_status: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
        }),
        { timing: 100 }
      );

      render(TEMPLATE);

      await waitFor(selectors.loader, { timeout: 100 });

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.knoxTable).doesNotExist();
      assert.dom(selectors.legacyTable).doesNotExist();

      await assertVulnerabilityTableType(assert, 'knox');
    });

    // ─── KnoxIQ disabled ────────────────────────────────────────────────────
    test('always shows the legacy table when KnoxIQ is disabled for the org, regardless of API scan status', async function (assert) {
      assert.expect(3);
      enableKnoxiqForTests(this, { knoxiq: false });
      createApiAnalysis(this.server, this.file.id);

      setupKnoxiqScanStatusMirage(this.server, {
        api: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
      });

      await render(TEMPLATE);

      assert.dom(selectors.loader).doesNotExist();
      await assertVulnerabilityTableType(assert, 'legacy');
    });
  }
);
