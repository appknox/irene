import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

module('Unit | Utility | compare-files', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    setupFileModelEndpoints(this.server);

    const store = this.owner.lookup('service:store');

    // create vulnerabilities and push to store
    const vulnerabilities = this.server.createList('vulnerability', 3).reduce(
      (acc, curr) => [
        ...acc,
        store.push(
          store.normalize('vulnerability', {
            attributes: curr.toJSON(),
            id: curr.id,
            relationships: {},
            type: 'vulnerabilities',
          })
        ),
      ],
      []
    );

    // Creates two files with varying computed risks for the analyses
    // computedRisks = [Risk1, Risk2] mapped to [file1Analyses, file2Analyses] during creation
    const createFiles = (computedRisks) =>
      Array.from(new Array(2)).map((_, idx) => {
        const file = this.server.create('file', {
          id: idx + 1,
        });

        const fileModel = store.push(store.normalize('file', file.toJSON()));

        let analyses = vulnerabilities.map((v) =>
          this.server.create('analysis', {
            vulnerability: v.id,
            file: file.id,
            status: ENUMS.ANALYSIS_STATUS.COMPLETED,
            computed_risk: computedRisks[idx],
          })
        );

        analyses = analyses.map((a) =>
          store.push(store.normalize('analysis', a.toJSON()))
        );

        return [fileModel, analyses];
      });

    // Asserts the analyses in the compare results and the files
    const assertAnalyses = (comparisons, assert, filesAnalyses) =>
      comparisons.forEach((comparison, idx) => {
        const analysis1 = comparison.analysis1;
        const analysis2 = comparison.analysis2;

        const [file1Analyses, file2Analyses] = filesAnalyses;

        const analysis1ComputedRisk = file1Analyses.objectAt(idx).computedRisk;
        const analysis2ComputedRisk = file2Analyses.objectAt(idx).computedRisk;

        assert.strictEqual(analysis1ComputedRisk, analysis1.computedRisk);
        assert.strictEqual(analysis2ComputedRisk, analysis2.computedRisk);
      });

    // Test props
    this.setProperties({ createFiles, assertAnalyses });
  });

  // RESOLVED: If file1 risk is passed
  test.each(
    'it categorizes the vulnerabilities of both files in resolved category',
    [
      [ENUMS.RISK.NONE, ENUMS.RISK.NONE],
      [ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN],
      [ENUMS.RISK.NONE, ENUMS.RISK.MEDIUM],
      [ENUMS.RISK.NONE, ENUMS.RISK.LOW],
      [ENUMS.RISK.NONE, undefined],
    ],
    async function (assert, [file1ComputedRisk, file2ComputedRisk]) {
      const filesInfo = this.createFiles([
        file1ComputedRisk,
        file2ComputedRisk,
      ]);

      const [, file1Analyses] = filesInfo[0];
      const [, file2Analyses] = filesInfo[1];

      const comparisons = compareFileAnalyses(file1Analyses, file2Analyses);
      const categories = getFileComparisonCategories(comparisons);

      assert.strictEqual(categories.resolved.length, comparisons.length);
      this.assertAnalyses(comparisons, assert, [file1Analyses, file2Analyses]);
    }
  );

  // NEW RISKS: If file1 risk is passed
  // CONDITION-1: file1 risk is undefined and file2 risk is a unknown, passed, or a severity
  // CONDITION-2: file1 risk is a severity and file2 risk is a unknown, passed, or undefined
  test.each(
    'it categorizes the vulnerabilities of both files in new risks category',
    [
      [undefined, ENUMS.RISK.UNKNOWN],
      [undefined, ENUMS.RISK.MEDIUM],
      [undefined, ENUMS.RISK.NONE],
      [ENUMS.RISK.MEDIUM, ENUMS.RISK.UNKNOWN],
      [ENUMS.RISK.LOW, ENUMS.RISK.NONE],
      [ENUMS.RISK.HIGH, undefined],
    ],
    async function (assert, [file1ComputedRisk, file2ComputedRisk]) {
      const filesInfo = this.createFiles([
        file1ComputedRisk,
        file2ComputedRisk,
      ]);

      const [, file1Analyses] = filesInfo[0];
      const [, file2Analyses] = filesInfo[1];

      const comparisons = compareFileAnalyses(file1Analyses, file2Analyses);
      const categories = getFileComparisonCategories(comparisons);

      assert.strictEqual(categories.newRisks.length, comparisons.length);
      this.assertAnalyses(comparisons, assert, [file1Analyses, file2Analyses]);
    }
  );

  // UNTESTED: If file1 risk is unknown
  test.each(
    'it categorizes the vulnerabilities of both files in untested category',
    [
      [ENUMS.RISK.UNKNOWN, ENUMS.RISK.UNKNOWN],
      [ENUMS.RISK.UNKNOWN, ENUMS.RISK.UNKNOWN],
      [ENUMS.RISK.UNKNOWN, ENUMS.RISK.NONE],
      [ENUMS.RISK.UNKNOWN, undefined],
    ],
    async function (assert, [file1ComputedRisk, file2ComputedRisk]) {
      const filesInfo = this.createFiles([
        file1ComputedRisk,
        file2ComputedRisk,
      ]);

      const [, file1Analyses] = filesInfo[0];
      const [, file2Analyses] = filesInfo[1];

      const comparisons = compareFileAnalyses(file1Analyses, file2Analyses);
      const categories = getFileComparisonCategories(comparisons);

      assert.strictEqual(categories.untested.length, comparisons.length);
      this.assertAnalyses(comparisons, assert, [file1Analyses, file2Analyses]);
    }
  );

  // RECURRING: If both file1 or file2 risks are severities
  test.each(
    'it categorizes the vulnerabilities of both files in recurring category',
    [
      [ENUMS.RISK.MEDIUM, ENUMS.RISK.MEDIUM],
      [ENUMS.RISK.LOW, ENUMS.RISK.MEDIUM],
      [ENUMS.RISK.HIGH, ENUMS.RISK.MEDIUM],
      [ENUMS.RISK.CRITICAL, ENUMS.RISK.MEDIUM],
    ],
    async function (assert, [file1ComputedRisk, file2ComputedRisk]) {
      const filesInfo = this.createFiles([
        file1ComputedRisk,
        file2ComputedRisk,
      ]);

      const [, file1Analyses] = filesInfo[0];
      const [, file2Analyses] = filesInfo[1];

      const comparisons = compareFileAnalyses(file1Analyses, file2Analyses);
      const categories = getFileComparisonCategories(comparisons);

      assert.strictEqual(categories.recurring.length, comparisons.length);
      this.assertAnalyses(comparisons, assert, [file1Analyses, file2Analyses]);
    }
  );
});
