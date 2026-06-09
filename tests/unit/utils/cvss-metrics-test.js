import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';
import {
  getMetricLabel,
  DEFAULT_CVSS_V4_METRICS,
  DEFAULT_CVSS_V3_METRICS,
  PASSED_CVSS_V4_METRICS,
  PASSED_CVSS_V3_METRICS,
  CVSS_V4_METRIC_DEFINITIONS,
  CVSS_V3_METRIC_DEFINITIONS,
} from 'irene/utils/cvss-metrics';

const CVSS_V4_METRIC_LABELS = {
  attack_vector: 'Attack Vector',
  attack_complexity: 'Attack Complexity',
  attack_requirements: 'Attack Requirements',
  privileges_required: 'Privileges Required',
  user_interaction: 'User Interaction',
  vuln_confidentiality: 'Vulnerable Confidentiality Impact',
  vuln_integrity: 'Vulnerable Integrity Impact',
  vuln_availability: 'Vulnerable Availability Impact',
  subsequent_confidentiality: 'Subsequent Confidentiality Impact',
  subsequent_integrity: 'Subsequent Integrity Impact',
  subsequent_availability: 'Subsequent Availability Impact',
};

const CVSS_V3_METRIC_LABELS = {
  attack_vector: 'Attack Vector',
  attack_complexity: 'Attack Complexity',
  privileges_required: 'Privileges Required',
  user_interaction: 'User Interaction',
  scope: 'Scope',
  confidentiality_impact: 'Confidentiality Impact',
  integrity_impact: 'Integrity Impact',
  availability_impact: 'Availability Impact',
};

module('Unit | Utility | cvss-metrics', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en');
  // ─── getMetricLabel ──────────────────────────────────────────────────────────

  module('getMetricLabel', function () {
    test('returns the correct label for a known v4 value', function (assert) {
      assert.strictEqual(
        getMetricLabel(
          ENUMS.CVSS_V4_ATTACK_VECTOR,
          ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK
        ),
        'NETWORK'
      );

      assert.strictEqual(
        getMetricLabel(
          ENUMS.CVSS_V4_ATTACK_VECTOR,
          ENUMS.CVSS_V4_ATTACK_VECTOR.LOCAL
        ),
        'LOCAL'
      );

      assert.strictEqual(
        getMetricLabel(
          ENUMS.CVSS_V4_ATTACK_VECTOR,
          ENUMS.CVSS_V4_ATTACK_VECTOR.UNKNOWN
        ),
        'UNKNOWN'
      );
    });

    test('disambiguates colliding abbreviations across v3 and v4', function (assert) {
      // Both v3 NOT_REQUIRED and v4 NONE map to the same abbreviation 'N'
      assert.strictEqual(
        getMetricLabel(
          ENUMS.CVSS_V3_USER_INTERACTION,
          ENUMS.CVSS_V3_USER_INTERACTION.NOT_REQUIRED
        ),
        'NOT REQUIRED'
      );

      assert.strictEqual(
        getMetricLabel(
          ENUMS.CVSS_V4_USER_INTERACTION,
          ENUMS.CVSS_V4_USER_INTERACTION.NONE
        ),
        'NONE'
      );
    });

    test('falls back to the raw string value when no match is found', function (assert) {
      assert.strictEqual(getMetricLabel(ENUMS.CVSS_V4_ATTACK_VECTOR, 'Z'), 'Z');
    });

    test('falls back to the stringified number when no match is found', function (assert) {
      assert.strictEqual(
        getMetricLabel(ENUMS.CVSS_V4_ATTACK_VECTOR, 999),
        '999'
      );
    });

    test('returns identical results on repeated calls (cache hit)', function (assert) {
      const first = getMetricLabel(
        ENUMS.CVSS_V4_ATTACK_VECTOR,
        ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK
      );

      const second = getMetricLabel(
        ENUMS.CVSS_V4_ATTACK_VECTOR,
        ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK
      );

      assert.strictEqual(first, second);
    });
  });

  // ─── DEFAULT_CVSS_V4_METRICS ─────────────────────────────────────────────────

  module('DEFAULT_CVSS_V4_METRICS', function () {
    test('all 11 fields are set to their UNKNOWN sentinel', function (assert) {
      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.attack_vector,
        ENUMS.CVSS_V4_ATTACK_VECTOR.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.attack_complexity,
        ENUMS.CVSS_V4_ATTACK_COMPLEXITY.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.attack_requirements,
        ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.privileges_required,
        ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.user_interaction,
        ENUMS.CVSS_V4_USER_INTERACTION.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.vuln_confidentiality,
        ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.vuln_integrity,
        ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.vuln_availability,
        ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.subsequent_confidentiality,
        ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.subsequent_integrity,
        ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V4_METRICS.subsequent_availability,
        ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.UNKNOWN
      );
    });
  });

  // ─── DEFAULT_CVSS_V3_METRICS ─────────────────────────────────────────────────

  module('DEFAULT_CVSS_V3_METRICS', function () {
    test('all 8 fields are set to their UNKNOWN sentinel', function (assert) {
      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.attack_vector,
        ENUMS.CVSS_V3_ATTACK_VECTOR.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.attack_complexity,
        ENUMS.CVSS_V3_ATTACK_COMPLEXITY.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.privileges_required,
        ENUMS.CVSS_V3_PRIVILEGES_REQUIRED.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.user_interaction,
        ENUMS.CVSS_V3_USER_INTERACTION.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.scope,
        ENUMS.CVSS_V3_SCOPE.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.confidentiality_impact,
        ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.integrity_impact,
        ENUMS.CVSS_V3_INTEGRITY_IMPACT.UNKNOWN
      );

      assert.strictEqual(
        DEFAULT_CVSS_V3_METRICS.availability_impact,
        ENUMS.CVSS_V3_AVAILABILITY_IMPACT.UNKNOWN
      );
    });
  });

  // ─── PASSED_CVSS_V4_METRICS ──────────────────────────────────────────────────

  module('PASSED_CVSS_V4_METRICS', function () {
    test('has the correct passed-state values for all 11 fields', function (assert) {
      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.attack_vector,
        ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.attack_complexity,
        ENUMS.CVSS_V4_ATTACK_COMPLEXITY.LOW
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.attack_requirements,
        ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.privileges_required,
        ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.user_interaction,
        ENUMS.CVSS_V4_USER_INTERACTION.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.vuln_confidentiality,
        ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.vuln_integrity,
        ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.vuln_availability,
        ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.subsequent_confidentiality,
        ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.subsequent_integrity,
        ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.NONE
      );

      assert.strictEqual(
        PASSED_CVSS_V4_METRICS.subsequent_availability,
        ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.NONE
      );
    });
  });

  // ─── PASSED_CVSS_V3_METRICS ──────────────────────────────────────────────────

  module('PASSED_CVSS_V3_METRICS', function () {
    test('impact fields are set to NONE', function (assert) {
      assert.strictEqual(
        PASSED_CVSS_V3_METRICS.confidentiality_impact,
        ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.NONE
      );
      assert.strictEqual(
        PASSED_CVSS_V3_METRICS.integrity_impact,
        ENUMS.CVSS_V3_INTEGRITY_IMPACT.NONE
      );
      assert.strictEqual(
        PASSED_CVSS_V3_METRICS.availability_impact,
        ENUMS.CVSS_V3_AVAILABILITY_IMPACT.NONE
      );
    });
  });

  // ─── CVSS_V4_METRIC_DEFINITIONS ──────────────────────────────────────────────

  module('CVSS_V4_METRIC_DEFINITIONS', function () {
    test('contains exactly 11 definitions in the correct order', function (assert) {
      assert.strictEqual(CVSS_V4_METRIC_DEFINITIONS.length, 11);

      assert.deepEqual(
        CVSS_V4_METRIC_DEFINITIONS.map((d) => d.key),
        [
          'attack_vector',
          'attack_complexity',
          'attack_requirements',
          'privileges_required',
          'user_interaction',
          'vuln_confidentiality',
          'vuln_integrity',
          'vuln_availability',
          'subsequent_confidentiality',
          'subsequent_integrity',
          'subsequent_availability',
        ]
      );
    });

    test('each definition has a label, non-empty options, and non-empty BASE_VALUES', function (assert) {
      assert.expect(CVSS_V4_METRIC_DEFINITIONS.length * 4);

      for (const def of CVSS_V4_METRIC_DEFINITIONS) {
        assert.ok(
          def.metricTranslationKey.length > 0,
          `${def.key}: has a metricTranslationKey`
        );
        assert.ok(def.options.length > 0, `${def.key}: has options`);

        assert.ok(
          Array.isArray(def.enumGroup['BASE_VALUES']),
          `${def.key}: enumGroup.BASE_VALUES is an array`
        );

        assert.ok(
          def.enumGroup['BASE_VALUES'].length > 0,
          `${def.key}: enumGroup.BASE_VALUES is non-empty`
        );
      }
    });

    test('BASE_VALUES does not include the UNKNOWN sentinel for any metric', function (assert) {
      assert.expect(CVSS_V4_METRIC_DEFINITIONS.length);

      for (const def of CVSS_V4_METRIC_DEFINITIONS) {
        const baseValues = def.enumGroup['BASE_VALUES'];
        const unknownForThisMetric = DEFAULT_CVSS_V4_METRICS[def.key];

        assert.false(
          baseValues.includes(unknownForThisMetric),
          `${def.key}: BASE_VALUES excludes UNKNOWN (${unknownForThisMetric})`
        );
      }
    });

    test('each metricTranslationKey resolves to the correct English label via intl', function (assert) {
      const intl = this.owner.lookup('service:intl');

      assert.expect(CVSS_V4_METRIC_DEFINITIONS.length * 2);

      for (const def of CVSS_V4_METRIC_DEFINITIONS) {
        const expected = CVSS_V4_METRIC_LABELS[def.key];
        const translated = intl.t(def.metricTranslationKey);

        assert.true(
          def.metricTranslationKey.startsWith('cvssVectorMetrics.'),
          `${def.key}: metricTranslationKey is namespaced under cvssVectorMetrics`
        );

        assert.strictEqual(
          translated,
          expected,
          `${def.key}: intl resolves "${def.metricTranslationKey}" to "${expected}"`
        );
      }
    });
  });

  // ─── CVSS_V3_METRIC_DEFINITIONS ──────────────────────────────────────────────

  module('CVSS_V3_METRIC_DEFINITIONS', function () {
    test('contains exactly 8 definitions in the correct order', function (assert) {
      assert.strictEqual(CVSS_V3_METRIC_DEFINITIONS.length, 8);
      assert.deepEqual(
        CVSS_V3_METRIC_DEFINITIONS.map((d) => d.key),
        [
          'attack_vector',
          'attack_complexity',
          'privileges_required',
          'user_interaction',
          'scope',
          'confidentiality_impact',
          'integrity_impact',
          'availability_impact',
        ]
      );
    });

    test('each definition has a label, non-empty options, and non-empty BASE_VALUES', function (assert) {
      assert.expect(CVSS_V3_METRIC_DEFINITIONS.length * 4);

      for (const def of CVSS_V3_METRIC_DEFINITIONS) {
        assert.ok(
          def.metricTranslationKey.length > 0,
          `${def.key}: has a metricTranslationKey`
        );
        assert.ok(def.options.length > 0, `${def.key}: has options`);

        assert.ok(
          Array.isArray(def.enumGroup['BASE_VALUES']),
          `${def.key}: enumGroup.BASE_VALUES is an array`
        );

        assert.ok(
          def.enumGroup['BASE_VALUES'].length > 0,
          `${def.key}: enumGroup.BASE_VALUES is non-empty`
        );
      }
    });

    test('BASE_VALUES does not include the UNKNOWN sentinel for any metric', function (assert) {
      assert.expect(CVSS_V3_METRIC_DEFINITIONS.length);

      for (const def of CVSS_V3_METRIC_DEFINITIONS) {
        const baseValues = def.enumGroup['BASE_VALUES'];
        const unknownForThisMetric = DEFAULT_CVSS_V3_METRICS[def.key];

        assert.false(
          baseValues.includes(unknownForThisMetric),
          `${def.key}: BASE_VALUES excludes UNKNOWN (${unknownForThisMetric})`
        );
      }
    });

    test('each metricTranslationKey resolves to the correct English label via intl', function (assert) {
      const intl = this.owner.lookup('service:intl');

      assert.expect(CVSS_V3_METRIC_DEFINITIONS.length * 2);

      for (const def of CVSS_V3_METRIC_DEFINITIONS) {
        const expected = CVSS_V3_METRIC_LABELS[def.key];
        const translated = intl.t(def.metricTranslationKey);

        assert.true(
          def.metricTranslationKey.startsWith('cvssVectorMetrics.'),
          `${def.key}: metricTranslationKey is namespaced under cvssVectorMetrics`
        );

        assert.strictEqual(
          translated,
          expected,
          `${def.key}: intl resolves "${def.metricTranslationKey}" to "${expected}"`
        );
      }
    });
  });
});
