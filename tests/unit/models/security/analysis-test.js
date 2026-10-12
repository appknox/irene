import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';

import {
  SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE as PASSED_OVERRIDE,
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
} from 'irene/utils/security-aeis';

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

    this.pushPassedAnalysis = (overrides = {}) =>
      this.pushAnalysis({
        exploitability_score: PASSED_OVERRIDE.score,
        exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.LOW,
        exploitability: {
          score: PASSED_OVERRIDE.score,
          exploitability_likelihood: PASSED_OVERRIDE.likelihood,
          signals: { ...PASSED_OVERRIDE.signals },
          ...overrides,
        },
      });
  });

  test('it exists', function (assert) {
    assert.ok(!!this.store.createRecord('security/analysis'));
  });

  // ─── isKnoxIqAnalysis ──────────────────────────────────────────────────────

  test('it is not a KnoxIQ analysis when all three fields are null', function (assert) {
    const analysis = this.pushAnalysis({
      exploitability: null,
      exploitability_likelihood: null,
      exploitability_score: null,
    });

    assert.false(analysis.isKnoxIqAnalysis);
  });

  test.each(
    'any one field carrying a value makes it a KnoxIQ analysis',
    [
      [{ exploitability: { score: 7.1, signals: {} } }],
      [{ exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH }],
      [{ exploitability_score: 7.1 }],
    ],
    function (assert, [field]) {
      const analysis = this.pushAnalysis({
        exploitability: null,
        exploitability_likelihood: null,
        exploitability_score: null,
        ...field,
      });

      assert.true(analysis.isKnoxIqAnalysis);
    }
  );

  test('a score of zero still counts as a KnoxIQ analysis', function (assert) {
    const analysis = this.pushAnalysis({
      exploitability: null,
      exploitability_likelihood: null,
      exploitability_score: 0,
    });

    assert.true(
      analysis.isKnoxIqAnalysis,
      'zero is a real score, not an absent one'
    );
  });

  // ─── hasPassedAeisOverride ─────────────────────────────────────────────────

  test('the canonical passed override reads as passed', function (assert) {
    assert.true(this.pushPassedAnalysis().hasPassedAeisOverride);
  });

  test('a title-cased likelihood still matches', function (assert) {
    const analysis = this.pushPassedAnalysis({
      exploitability_likelihood: 'Low',
    });

    assert.true(analysis.hasPassedAeisOverride);
  });

  test.each(
    'a different score does not read as passed',
    [[7.1], [0.1], [null]],
    function (assert, [score]) {
      const analysis = this.pushAnalysis({
        exploitability_score: score,
        exploitability: {
          score,
          exploitability_likelihood: PASSED_OVERRIDE.likelihood,
          signals: { ...PASSED_OVERRIDE.signals },
        },
      });

      assert.false(analysis.hasPassedAeisOverride);
    }
  );

  test.each(
    'a different likelihood does not read as passed',
    [['high'], ['medium'], ['critical'], ['Unknown']],
    function (assert, [likelihood]) {
      const analysis = this.pushPassedAnalysis({
        exploitability_likelihood: likelihood,
      });

      assert.false(analysis.hasPassedAeisOverride);
    }
  );

  test.each(
    'any vector differing stops it reading as passed',
    SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.map((key) => [key]),
    function (assert, [key]) {
      const analysis = this.pushPassedAnalysis({
        signals: {
          ...PASSED_OVERRIDE.signals,
          [key]: 'unknown',
        },
      });

      assert.false(
        analysis.hasPassedAeisOverride,
        `${key} differing is enough`
      );
    }
  );

  test('a missing vector does not read as passed', function (assert) {
    const analysis = this.pushPassedAnalysis({ signals: {} });

    assert.false(analysis.hasPassedAeisOverride);
  });

  test('an analysis with no exploitability does not read as passed', function (assert) {
    const analysis = this.pushAnalysis({
      exploitability: null,
      exploitability_likelihood: null,
      exploitability_score: null,
    });

    assert.false(analysis.hasPassedAeisOverride);
  });

  // ─── isPassed ──────────────────────────────────────────────────────────────

  test.each(
    'isPassed follows the risk',
    [
      [ENUMS.RISK.NONE, true],
      [ENUMS.RISK.LOW, false],
      [ENUMS.RISK.CRITICAL, false],
    ],
    function (assert, [risk, expected]) {
      assert.strictEqual(this.pushAnalysis({ risk }).isPassed, expected);
    }
  );
});
