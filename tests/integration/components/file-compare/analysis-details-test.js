import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

const CVSS_METRICS_HUMANIZED = [
  { key: 'Attack Vector', value: 'Network' },
  { key: 'Attack Complexity', value: 'Low' },
  { key: 'Privileges Required', value: 'None' },
  { key: 'User Interaction', value: 'Not Required' },
  { key: 'Scope', value: 'Changed' },
  { key: 'Confidentiality Impact', value: 'High' },
  { key: 'Integrity Impact', value: 'High' },
  { key: 'Availability Impact', value: 'High' },
];

const CVSS_V4_METRICS_HUMANIZED = [
  { key: 'Attack Vector', value: 'Network' },
  { key: 'Attack Complexity', value: 'Low' },
  { key: 'Attack Requirements', value: 'None' },
  { key: 'Privileges Required', value: 'None' },
  { key: 'User Interaction', value: 'None' },
  { key: 'Vulnerable System Confidentiality', value: 'High' },
  { key: 'Vulnerable System Integrity', value: 'High' },
  { key: 'Vulnerable System Availability', value: 'High' },
  { key: 'Subsequent System Confidentiality', value: 'High' },
  { key: 'Subsequent System Integrity', value: 'High' },
  { key: 'Subsequent System Availability', value: 'High' },
];

const CVSS_CASES = [
  {
    label: 'v3',
    cvssVersion: ENUMS.SUPPORTED_CVSS_VERSIONS.V3,
    labelKey: 'cvssV3',
    metrics: CVSS_METRICS_HUMANIZED,
  },
  {
    label: 'v4',
    cvssVersion: ENUMS.SUPPORTED_CVSS_VERSIONS.V4,
    labelKey: 'cvssV4',
    metrics: CVSS_V4_METRICS_HUMANIZED,
  },
];

module(
  'Integration | Component | file-compare/analysis-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.server.get('/v2/analyses/:id', (schema, req) =>
        schema.analyses.find(`${req.params.id}`)?.toJSON()
      );
    });

    const createAnalysis = (context, attrs = {}) => {
      const serverAnalysis = context.server.create('analysis', {
        cvss_version: ENUMS.SUPPORTED_CVSS_VERSIONS.V3,
        cvss_base: 8.0,
        cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
        cvss_metrics_humanized: CVSS_METRICS_HUMANIZED,
        ...attrs,
      });

      const analysisOverview = context.store.push(
        context.store.normalize('analysis-overview', {
          id: serverAnalysis.id,
          risk: ENUMS.RISK.HIGH,
          status: ENUMS.ANALYSIS_STATUS.COMPLETED,
          computed_risk: ENUMS.RISK.HIGH,
        })
      );

      return { serverAnalysis, analysisOverview };
    };

    // ── cvssTitle getter ─────────────────────────────────────────────────────

    test.each(
      'it shows the correct CVSS label when cvssVector is present',
      CVSS_CASES,
      async function (assert, { cvssVersion, labelKey, label }) {
        const { analysisOverview } = createAnalysis(this, {
          cvss_version: cvssVersion,
        });

        this.set('analysis', analysisOverview);

        await render(hbs`
          <FileCompare::AnalysisDetails
            @analysis={{this.analysis}}
            @analysisStatus='Recurring'
          />
        `);

        assert
          .dom('[data-test-analysisDetails-regulatory="cvssv3"]')
          .exists(`CVSS section renders for ${label} analysis`);

        assert
          .dom(
            '[data-test-analysisDetails-regulatory="cvssv3"] [data-test-analysisDetails-regulatoryLabel]'
          )
          .hasText(t(labelKey), `Label is correct for ${label} analysis`);
      }
    );

    test('it does not render the cvss section when cvssVector is absent', async function (assert) {
      const { analysisOverview } = createAnalysis(this, {
        cvss_vector: null,
      });

      this.set('analysis', analysisOverview);

      await render(hbs`
        <FileCompare::AnalysisDetails
          @analysis={{this.analysis}}
          @analysisStatus='Recurring'
        />
      `);

      assert
        .dom('[data-test-analysisDetails-regulatory="cvssv3"]')
        .doesNotExist('CVSS section absent when cvssVector is null');

      assert
        .dom('[data-test-analysisDetails-regulatory="cvssv3metrics"]')
        .doesNotExist('CVSS metrics section absent when cvssVector is null');
    });

    test.each(
      'it renders the base score and all metrics when cvssVector is present',
      CVSS_CASES,
      async function (assert, { cvssVersion, labelKey, metrics, label }) {
        const { analysisOverview, serverAnalysis } = createAnalysis(this, {
          cvss_version: cvssVersion,
          cvss_metrics_humanized: metrics,
        });

        this.set('analysis', analysisOverview);

        await render(hbs`
          <FileCompare::AnalysisDetails
            @analysis={{this.analysis}}
            @analysisStatus='Recurring'
          />
        `);

        assert
          .dom(
            '[data-test-analysisDetails-regulatory="cvssv3"] [data-test-analysisDetails-regulatoryLabel]'
          )
          .hasText(t(labelKey), `Label is correct for ${label} analysis`);

        assert
          .dom(
            '[data-test-analysisDetails-regulatory="cvssv3"] [data-test-analysisDetails-regulatoryValue]'
          )
          .hasText(
            String(serverAnalysis.cvss_base),
            'CVSS base score is displayed'
          );

        assert
          .dom(
            '[data-test-analysisDetails-regulatory="cvssv3metrics"] [data-test-analysisDetails-regulatoryLabel]'
          )
          .hasText(t('cvssMetrics'), 'Metrics label is rendered');

        const items = findAll(
          '[data-test-analysisDetail-regulatoryContent-listItem]'
        );

        assert.strictEqual(
          items.length,
          metrics.length,
          `One list item per ${label} metric`
        );

        metrics.forEach((metric, i) => {
          assert
            .dom(
              items[i].querySelector(
                '[data-test-analysisDetail-regulatoryContent-labelContainer]'
              )
            )
            .hasText(metric.key);

          assert
            .dom(
              items[i].querySelector(
                '[data-test-analysisDetail-regulatoryContent-ValueContainer]'
              )
            )
            .hasText(metric.value);
        });
      }
    );
  }
);
