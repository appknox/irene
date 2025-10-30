import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, findAll, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

// Risks
const riskTypes = [
  ENUMS.RISK.CRITICAL,
  ENUMS.RISK.HIGH,
  ENUMS.RISK.MEDIUM,
  ENUMS.RISK.LOW,
];

module('Integration | Component | file-compare/table', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Store service
    this.store = this.owner.lookup('service:store');

    // Profile Model
    this.server.create('profile');

    // Creates an analyses and maps a vulnerability to it
    const createAnalyses = (vulnerability, analysisStatus, computedRisk) => {
      const analysis = this.server.create('analysis');

      const normalizedAnalysis = this.store.normalize('analysis', {
        ...analysis.toJSON(),
        status: analysisStatus,
        computed_risk: computedRisk,
      });

      const analysisModel = this.store.push(normalizedAnalysis);

      analysisModel.set('vulnerability', vulnerability);

      return analysisModel;
    };

    // File Analyses Models
    const project = this.server.create('project');
    const vulnerabilities = [1].map(() => {
      const vul = this.server.create('vulnerability');
      const vulnerability = this.store.createRecord('vulnerability', {
        ...vul.toJSON(),
      });

      return vulnerability;
    });

    // Creates seven files that will ultimately serve as both base and compare files
    const files = this.server.createList('file', 7);
    const fileModels = files.map((file) => {
      const normalizedFile = this.store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
      });

      return this.store.push(normalizedFile);
    });

    this.setProperties({
      files: [fileModels[0], fileModels[1]],
      vulnerabilities,
      createAnalyses,
    });

    // Common server mocks
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });
  });

  test.each(
    'it renders the files analyses comparison results',
    [
      [
        'newRisks',
        ENUMS.ANALYSIS.COMPLETED,
        faker.helpers.arrayElement(riskTypes),
        ENUMS.RISK.NONE,
      ],
      ['recurring', ENUMS.ANALYSIS.COMPLETED, ENUMS.RISK.HIGH, ENUMS.RISK.LOW],
      ['resolved', ENUMS.ANALYSIS.COMPLETED, ENUMS.RISK.NONE, ENUMS.RISK.HIGH],
      [
        'untested',
        ENUMS.ANALYSIS.WAITING,
        ENUMS.RISK.UNKNOWN,
        ENUMS.RISK.MEDIUM,
      ],
    ],
    async function (
      assert,
      [
        comparisonFilterKey,
        analysisStatus,
        file1ComputedRisk,
        file2ComputedRisk,
      ]
    ) {
      const file1Analyses = this.vulnerabilities.map((v) =>
        this.createAnalyses(v, analysisStatus, file1ComputedRisk)
      );

      const file2Analyses = this.vulnerabilities.map((v) =>
        this.createAnalyses(v, analysisStatus, file2ComputedRisk)
      );

      const file1 = this.files[0];
      const file2 = this.files[1];

      file1.set('analyses', file1Analyses);
      file2.set('analyses', file2Analyses);

      this.comparisonFilterKey = comparisonFilterKey;

      // Gets all comparison data for category
      const comparisons = compareFileAnalyses(file1, file2);
      const compareCategories = getFileComparisonCategories(comparisons, true);
      this.filteredComparisons = compareCategories[this.comparisonFilterKey];

      await render(hbs`
        <FileCompare::Table @files={{this.files}} @comparisonFilterKey={{this.comparisonFilterKey}} @filteredComparisons={{this.filteredComparisons}} />
      `);

      assert.dom('[data-test-fileCompare-table-root]').exists();

      // Vulnerability row item(s)
      const renderedCompareResults = findAll(
        '[data-test-fileCompareTable-comparisonRow]'
      );

      // Files details row is first item on table
      const filesDetailsRow = renderedCompareResults[0];

      assert
        .dom(filesDetailsRow)
        .exists()
        .containsText(file1.id)
        .containsText(file1.version)
        .containsText(file2.id)
        .containsText(file2.version);

      // All rendered vulnerabilities/risks
      const renderedRisks = renderedCompareResults.slice(1);

      assert.strictEqual(this.filteredComparisons.length, renderedRisks.length);

      // Sanity check for first row
      const risk = this.filteredComparisons[0];
      const file1AnalysisDetails = analysisRiskStatus([
        risk.analysis1.computedRisk,
        risk.analysis1.status,
        risk.analysis1.isOverriddenRisk,
      ]);

      const file2AnalysisDetails = analysisRiskStatus([
        risk.analysis2.computedRisk,
        risk.analysis2.status,
        risk.analysis2.isOverriddenRisk,
      ]);

      assert
        .dom(renderedRisks[0])
        .exists()
        .containsText(risk.vulnerability.get('name'))
        .containsText(file1AnalysisDetails.label)
        .containsText(file2AnalysisDetails.label);
    }
  );

  test('it shows a nonexistent test case icon in the new risks tab', async function (assert) {
    const file1Analyses = this.vulnerabilities.map((v) =>
      this.createAnalyses(v, ENUMS.ANALYSIS.COMPLETED, ENUMS.RISK.HIGH)
    );

    const file2Analyses = this.vulnerabilities.map(() =>
      this.createAnalyses(null, ENUMS.ANALYSIS.COMPLETED)
    );

    const file1 = this.files[0];
    const file2 = this.files[1];

    file1.set('analyses', file1Analyses);
    file2.set('analyses', file2Analyses);

    this.comparisonFilterKey = 'newRisks';

    // Gets all comparison data for category
    const comparisons = compareFileAnalyses(file1, file2);
    const compareCategories = getFileComparisonCategories(comparisons, true);
    this.filteredComparisons = compareCategories[this.comparisonFilterKey];

    await render(hbs`
        <FileCompare::Table @files={{this.files}} @comparisonFilterKey={{this.comparisonFilterKey}} @filteredComparisons={{this.filteredComparisons}} />
      `);

    assert.dom('[data-test-fileCompare-table-root]').exists();

    // Vulnerability row item(s)
    const renderedCompareResults = findAll(
      '[data-test-fileCompareTable-comparisonRow]'
    );

    // Files details row is first item on table
    const filesDetailsRow = renderedCompareResults[0];

    assert
      .dom(filesDetailsRow)
      .exists()
      .containsText(file1.id)
      .containsText(file1.version)
      .containsText(file2.id)
      .containsText(file2.version);

    // All rendered vulnerabilities/risks
    const renderedRisks = renderedCompareResults.slice(1);

    assert.strictEqual(this.filteredComparisons.length, renderedRisks.length);

    // Sanity check for first row
    const risk = this.filteredComparisons[0];
    const file1AnalysisDetails = analysisRiskStatus([
      risk.analysis1.computedRisk,
      risk.analysis1.status,
      risk.analysis1.isOverriddenRisk,
    ]);

    assert
      .dom(renderedRisks[0])
      .exists()
      .containsText(risk.vulnerability.get('name'))
      .containsText(file1AnalysisDetails.label);

    assert
      .dom(
        '[data-test-fileCompareTable-riskType-vulnerabityRowItem-newTestCaseIcon]'
      )
      .exists();

    const tooltipSelector =
      '[data-test-fileCompareTable-riskType-vulnerabityRowItem-newTestCaseTootlip]';

    const newTestCaseTooltip = find(tooltipSelector);

    await triggerEvent(newTestCaseTooltip, 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-content]')
      .exists()
      .containsText(t('fileCompare.nonExistentTestCase'));
  });
});
