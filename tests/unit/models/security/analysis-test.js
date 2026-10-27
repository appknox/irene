import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';

module('Unit | Model | security/analysis', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    this.pushAnalysis = (attrs = {}) => {
      const record = this.server.create('security/analysis', attrs);

      return this.store.push(
        this.store.normalize('security/analysis', record.toJSON())
      );
    };

    this.pushAnalysisInFile = (fileAttrs = {}, analysisAttrs = {}) => {
      const file = this.server.create('security/file', fileAttrs);

      this.store.push(this.store.normalize('security/file', file.toJSON()));

      return this.pushAnalysis({ ...analysisAttrs, file: file.id });
    };
  });

  test('it exists', function (assert) {
    assert.ok(!!this.store.createRecord('security/analysis'));
  });

  // ─── isKnoxIqAnalysis ──────────────────────────────────────────────────────

  test('an analysis in a file KnoxIQ never scanned is not a KnoxIQ analysis', function (assert) {
    assert.false(
      this.pushAnalysisInFile({ is_knoxiq_file: false }).isKnoxIqAnalysis
    );
  });

  test('an analysis in a KnoxIQ-scanned file is a KnoxIQ analysis', function (assert) {
    assert.true(
      this.pushAnalysisInFile({ is_knoxiq_file: true }).isKnoxIqAnalysis
    );
  });

  test('a KnoxIQ analysis with no exploitability yet still counts', function (assert) {
    // KnoxIQ skips analyses it considers not worth validating, and leaves
    // exploitability null until a validation finishes. Neither stops the
    // analysis belonging to a KnoxIQ file.
    const analysis = this.pushAnalysisInFile(
      { is_knoxiq_file: true },
      {
        exploitability: null,
        exploitability_likelihood: null,
        exploitability_score: null,
      }
    );

    assert.true(analysis.isKnoxIqAnalysis);
  });

  // ─── isUntested ────────────────────────────────────────────────────────────

  test('an analysis is untested until it carries a risk', function (assert) {
    assert.true(this.pushAnalysis({ risk: ENUMS.RISK.UNKNOWN }).isUntested);
    assert.false(this.pushAnalysis({ risk: ENUMS.RISK.HIGH }).isUntested);
    assert.false(
      this.pushAnalysis({ risk: ENUMS.RISK.NONE }).isUntested,
      'passed is a verdict, not an absence of one'
    );
  });

  // ─── isKnoxiqAllFp ─────────────────────────────────────────────────────────

  test('an analysis reports whether every finding on it is a false positive', function (assert) {
    assert.true(this.pushAnalysis({ is_knoxiq_all_fp: true }).isKnoxiqAllFp);
    assert.false(this.pushAnalysis({ is_knoxiq_all_fp: false }).isKnoxiqAllFp);
  });
});
