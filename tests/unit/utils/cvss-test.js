import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

import {
  computeCVSSMetrics,
  CvssV4VersionState,
  CvssV3VersionState,
} from 'irene/utils/cvss';

import {
  DEFAULT_CVSS_V4_METRICS,
  DEFAULT_CVSS_V3_METRICS,
  PASSED_CVSS_V4_METRICS,
} from 'irene/utils/cvss-metrics';

module('Unit | Utility | cvss', function () {
  // ─── computeCVSSMetrics ──────────────────────────────────────────────────────

  module('computeCVSSMetrics', function () {
    test('converts v4 metrics to a plain record with the same key/value pairs', function (assert) {
      const result = computeCVSSMetrics(DEFAULT_CVSS_V4_METRICS);
      assert.deepEqual(result, DEFAULT_CVSS_V4_METRICS);
    });

    test('converts v3 metrics to a plain record with the same key/value pairs', function (assert) {
      const result = computeCVSSMetrics(DEFAULT_CVSS_V3_METRICS);
      assert.deepEqual(result, DEFAULT_CVSS_V3_METRICS);
    });

    test('returns a new object — does not return the same reference', function (assert) {
      const result = computeCVSSMetrics(DEFAULT_CVSS_V4_METRICS);
      assert.notStrictEqual(result, DEFAULT_CVSS_V4_METRICS);
    });
  });

  // ─── CvssV4VersionState ──────────────────────────────────────────────────────

  module('CvssV4VersionState', function () {
    test('initialises with all-UNKNOWN metrics and default score state', function (assert) {
      const state = new CvssV4VersionState();

      assert.deepEqual(state.metrics, DEFAULT_CVSS_V4_METRICS);
      assert.strictEqual(state.base, -1.0);
      assert.strictEqual(state.risk, ENUMS.RISK.UNKNOWN);
      assert.strictEqual(state.vector, '');
      assert.false(state.isInvalidBase);
    });

    test('isEmpty is true when all metrics are UNKNOWN', function (assert) {
      const state = new CvssV4VersionState();
      assert.true(state.isEmpty);
    });

    test('isEmpty is false after any single metric is changed', function (assert) {
      const state = new CvssV4VersionState();
      state.applyMetrics({
        attack_vector: ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK,
      });
      assert.false(state.isEmpty);
    });

    test('isValid is true when empty (all UNKNOWN)', function (assert) {
      const state = new CvssV4VersionState();
      assert.true(state.isValid);
    });

    test('isValid is false when only some metrics are set', function (assert) {
      const state = new CvssV4VersionState();
      state.applyMetrics({
        attack_vector: ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK,
      });

      assert.false(state.isValid);
    });

    test('isValid is true when all metrics are valid base values', function (assert) {
      const state = new CvssV4VersionState();

      state.applyMetrics(PASSED_CVSS_V4_METRICS);
      assert.true(state.isValid);
    });

    test('applyMetrics merges into current state without replacing unset keys', function (assert) {
      const state = new CvssV4VersionState();
      state.applyMetrics({ attack_vector: ENUMS.CVSS_V4_ATTACK_VECTOR.LOCAL });

      assert.strictEqual(
        state.metrics.attack_vector,
        ENUMS.CVSS_V4_ATTACK_VECTOR.LOCAL
      );

      assert.strictEqual(
        state.metrics.attack_complexity,
        ENUMS.CVSS_V4_ATTACK_COMPLEXITY.UNKNOWN,
        'other metrics remain UNKNOWN'
      );
    });

    test('applyScore sets base, risk, vector and clears isInvalidBase', function (assert) {
      const state = new CvssV4VersionState();
      state.isInvalidBase = true;

      state.applyScore(
        { cvss_base: 7.5, risk: ENUMS.RISK.HIGH },
        'CVSS:4.0/AV:N/...'
      );

      assert.strictEqual(state.base, 7.5);
      assert.strictEqual(state.risk, ENUMS.RISK.HIGH);
      assert.strictEqual(state.vector, 'CVSS:4.0/AV:N/...');
      assert.false(state.isInvalidBase);
    });

    test('buildVector produces a correctly formatted CVSS 4.0 string', function (assert) {
      const state = new CvssV4VersionState();
      state.applyMetrics(PASSED_CVSS_V4_METRICS);

      const vector = state.buildVector();

      assert.ok(vector.startsWith('CVSS:4.0/'), 'starts with CVSS:4.0/');

      assert.ok(
        vector.includes(`AV:${ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK}`),
        'includes AV field'
      );

      assert.ok(
        vector.includes(`AC:${ENUMS.CVSS_V4_ATTACK_COMPLEXITY.LOW}`),
        'includes AC field'
      );

      assert.strictEqual(
        vector,
        'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N'
      );
    });

    test('details getter reflects current state', function (assert) {
      const state = new CvssV4VersionState();
      const details = state.details;

      assert.strictEqual(details.version, 4);
      assert.strictEqual(details.base, -1.0);
      assert.strictEqual(details.risk, ENUMS.RISK.UNKNOWN);
      assert.strictEqual(details.vector, '');
      assert.false(details.isInValidCvssBase);
      assert.deepEqual(details.metrics, DEFAULT_CVSS_V4_METRICS);
    });

    test('details getter updates after applyScore', function (assert) {
      const state = new CvssV4VersionState();

      state.applyScore(
        { cvss_base: 9.0, risk: ENUMS.RISK.CRITICAL },
        'CVSS:4.0/...'
      );

      const details = state.details;
      assert.strictEqual(details.base, 9.0);
      assert.strictEqual(details.risk, ENUMS.RISK.CRITICAL);
      assert.strictEqual(details.vector, 'CVSS:4.0/...');
    });
  });

  // ─── CvssV3VersionState ──────────────────────────────────────────────────────

  module('CvssV3VersionState', function () {
    test('initialises with all-UNKNOWN metrics and default score state', function (assert) {
      const state = new CvssV3VersionState();

      assert.deepEqual(state.metrics, DEFAULT_CVSS_V3_METRICS);
      assert.strictEqual(state.base, -1.0);
      assert.strictEqual(state.risk, ENUMS.RISK.UNKNOWN);
      assert.strictEqual(state.vector, '');
      assert.false(state.isInvalidBase);
    });

    test('isEmpty is true when all metrics are UNKNOWN', function (assert) {
      const state = new CvssV3VersionState();
      assert.true(state.isEmpty);
    });

    test('isEmpty is false after any single metric is changed', function (assert) {
      const state = new CvssV3VersionState();

      state.applyMetrics({
        attack_vector: ENUMS.CVSS_V3_ATTACK_VECTOR.NETWORK,
      });

      assert.false(state.isEmpty);
    });

    test('isValid is true when empty', function (assert) {
      const state = new CvssV3VersionState();
      assert.true(state.isValid);
    });

    test('isValid is false when only some metrics are set', function (assert) {
      const state = new CvssV3VersionState();

      state.applyMetrics({
        attack_vector: ENUMS.CVSS_V3_ATTACK_VECTOR.NETWORK,
      });

      assert.false(state.isValid);
    });

    test('isValid is true when all metrics are valid base values', function (assert) {
      const state = new CvssV3VersionState();

      state.applyMetrics({
        attack_vector: ENUMS.CVSS_V3_ATTACK_VECTOR.NETWORK,
        attack_complexity: ENUMS.CVSS_V3_ATTACK_COMPLEXITY.LOW,
        privileges_required: ENUMS.CVSS_V3_PRIVILEGES_REQUIRED.NONE,
        user_interaction: ENUMS.CVSS_V3_USER_INTERACTION.NOT_REQUIRED,
        scope: ENUMS.CVSS_V3_SCOPE.UNCHANGED,
        confidentiality_impact: ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.NONE,
        integrity_impact: ENUMS.CVSS_V3_INTEGRITY_IMPACT.NONE,
        availability_impact: ENUMS.CVSS_V3_AVAILABILITY_IMPACT.NONE,
      });

      assert.true(state.isValid);
    });

    test('buildVector produces a correctly formatted CVSS 3.1 string', function (assert) {
      const state = new CvssV3VersionState();

      state.applyMetrics({
        attack_vector: ENUMS.CVSS_V3_ATTACK_VECTOR.NETWORK,
        attack_complexity: ENUMS.CVSS_V3_ATTACK_COMPLEXITY.LOW,
        privileges_required: ENUMS.CVSS_V3_PRIVILEGES_REQUIRED.NONE,
        user_interaction: ENUMS.CVSS_V3_USER_INTERACTION.NOT_REQUIRED,
        scope: ENUMS.CVSS_V3_SCOPE.UNCHANGED,
        confidentiality_impact: ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.NONE,
        integrity_impact: ENUMS.CVSS_V3_INTEGRITY_IMPACT.NONE,
        availability_impact: ENUMS.CVSS_V3_AVAILABILITY_IMPACT.NONE,
      });

      const vector = state.buildVector();

      assert.ok(vector.startsWith('CVSS:3.1/'), 'starts with CVSS:3.1/');

      assert.ok(
        vector.includes(`AV:${ENUMS.CVSS_V3_ATTACK_VECTOR.NETWORK}`),
        'includes AV field'
      );

      assert.ok(vector.includes('S:'), 'includes Scope field');
    });

    test('details getter reflects current state', function (assert) {
      const state = new CvssV3VersionState();
      const details = state.details;

      assert.strictEqual(details.version, 3);
      assert.strictEqual(details.base, -1.0);
      assert.strictEqual(details.risk, ENUMS.RISK.UNKNOWN);
      assert.strictEqual(details.vector, '');
      assert.false(details.isInValidCvssBase);
      assert.deepEqual(details.metrics, DEFAULT_CVSS_V3_METRICS);
    });
  });
});
