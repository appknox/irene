import { Response } from 'miragejs';
import { faker } from '@faker-js/faker';
import { module, test } from 'qunit';
import { selectFiles } from 'ember-file-upload/test-support';

import Service from '@ember/service';
import { click, fillIn, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { selectChoose } from 'ember-power-select/test-support';

import {
  getMetricLabel,
  DEFAULT_CVSS_V3_METRICS,
  DEFAULT_CVSS_V4_METRICS,
  PASSED_CVSS_V3_METRICS,
  PASSED_CVSS_V4_METRICS,
} from 'irene/utils/cvss-metrics';
import { fileExtension } from 'irene/helpers/file-extension';
import { riskText } from 'irene/helpers/risk-text';

import ENUMS from 'irene/enums';
import styles from 'irene/components/ak-select/index.scss';

// JSON API Serializer
const serializeForJsonApi = (payload, type) => ({
  data: {
    attributes: payload,
    id: payload.id,
    type,
  },
});

const analysisStatusTextMap = {
  [ENUMS.ANALYSIS_STATUS.ERROR]: 'Errored',
  [ENUMS.ANALYSIS_STATUS.WAITING]: 'Not started',
  [ENUMS.ANALYSIS_STATUS.RUNNING]: 'Scanning',
  [ENUMS.ANALYSIS_STATUS.COMPLETED]: 'Completed',
  [ENUMS.ANALYSIS_STATUS.UNKNOWN]: 'Unknown',
};

const AkSelectClasses = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

// Services
class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

// Test body
module('Integration | Component | security/analysis-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    // Services
    this.owner.register('service:browser/window', WindowStub);
    this.owner.register('service:notifications', NotificationsStub);

    const window = this.owner.lookup('service:browser/window');
    const store = this.owner.lookup('service:store');

    // Server Mocks
    [
      ['owasps', 'owasps', 'owasp', true],
      ['v2/owaspmobile2024s', 'owaspmobile2024s', 'owaspmobile2024'],
      ['v2/owaspapi2023s', 'owaspapi2023s', 'owaspapi2023'],
      ['v2/cwes', 'cwes', 'cwe'],
      ['v2/asvses', 'asvses', 'asvs'],
      ['v2/masvses', 'masvses', 'masvs'],
      ['v2/mstgs', 'mstgs', 'mstg'],
      ['v2/gdprs', 'gdprs', 'gdpr'],
      ['pcidsses', 'pcidsses', 'pcidss', true],
      ['v2/pcidss4s', 'pcidss4s', 'pcidss4'],
      ['v2/hipaas', 'hipaas', 'hipaa'],
      ['v2/nistsp80053s', 'nistsp80053s', 'nistsp80053'],
      ['v2/nistsp800171s', 'nistsp800171s', 'nistsp800171'],
      ['v2/samas', 'samas', 'sama'],
    ].forEach(([urlParam, schemaKey, key, isJsonApi]) => {
      this.server.get(`/${urlParam}/:id`, (schema, req) => {
        const json = schema[schemaKey].find(`${req.params.id}`)?.toJSON();

        return isJsonApi ? serializeForJsonApi(json, key) : json;
      });

      this.server.get(`/${urlParam}`, (schema) => {
        const results = schema[schemaKey].all().models;

        return isJsonApi
          ? {
              data: results.map((p) => serializeForJsonApi(p.attrs, key).data),
            }
          : {
              previous: null,
              next: null,
              count: results.length,
              results,
            };
      });
    });

    this.server.get('/hudson-api/analyses/:id', (schema, req) => {
      return schema['security/analyses'].find(`${req.params.id}`)?.toJSON();
    });

    this.server.put('/hudson-api/analyses/:id', (schema, req) => {
      const data = JSON.parse(req.requestBody);

      schema.db['security/analyses'].update(req.params.id, data);

      return schema['security/analyses'].find(req.params.id).toJSON();
    });

    this.server.get('/hudson-api/projects/:id', (schema, req) => {
      return schema['security/projects'].find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/hudson-api/files/:id', (schema, req) => {
      return schema['security/files'].find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/hudson-api/projects', () => {
      return new Response(200);
    });

    this.server.get('/vulnerabilities', (schema) => {
      return {
        data: schema.vulnerabilities.all().models.map((model) => ({
          attributes: model,
          id: model.id,
          relationships: {},
          type: 'vulnerabilities',
        })),
      };
    });

    // Models
    this.server.createList('owasp', 3).map((o) => o.id);

    const secProj = this.server.create('security/project', {
      id: 1,
      is_manual_scan_available: true,
    });

    const secFile = this.server.create('security/file', {
      id: 1,
      project: secProj.id,
      analyses: [1],
    });

    const secFileModel = store.push(
      store.normalize('security/file', secFile.toJSON())
    );

    // Creates vulnerabilities and maps them to individual analysis
    const vulnerability = this.server.create('vulnerability');

    const vulnerabilityModel = store.push(
      store.normalize(
        'vulnerability',
        serializeForJsonApi(vulnerability.toJSON(), 'vulnerabilities').data
      )
    );

    const secAnalysis = store.push(
      store.normalize(
        'security/analysis',
        this.server
          .create('security/analysis', 'withAllRegulatory', {
            vulnerability: vulnerabilityModel.id,
            file: secFileModel.id,
            risk: ENUMS.RISK.HIGH,
            status: ENUMS.ANALYSIS_STATUS.COMPLETED,
          })
          .toJSON()
      )
    );

    this.setProperties({
      secFileModel,
      secProj,
      window,
      store,
      vulnerabilityModel,
      secAnalysis,
    });
  });

  test.each(
    'it renders analysis details header',
    [{ isPassed: true }, { isPassed: false }],
    async function (assert, { isPassed }) {
      this.secAnalysis.set(
        'risk',
        isPassed ? ENUMS.RISK.NONE : ENUMS.RISK.HIGH
      );

      await render(
        hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
      );

      assert
        .dom('[data-test-securityAnalysisDetails-header-container]')
        .exists();

      assert
        .dom(
          '[data-test-securityAnalysisDetailsHeader-analysisInfoAndHeaderActions]'
        )
        .exists()
        .containsText(this.secAnalysis.id)
        .containsText(this.secAnalysis.get('vulnerability').get('name'));

      if (!isPassed) {
        assert
          .dom('[data-test-securityAnalysisDetailsHeader-markAsPassedBtn]')
          .exists()
          .hasText('Mark as Passed');
      }

      assert
        .dom('[data-test-securityAnalysisDetailsHeader-visitDashboardButton]')
        .exists()
        .containsText('Visit Analysis Page')
        .hasAttribute('target', '_blank')
        .hasAttribute(
          'href',
          new RegExp(
            `/dashboard/file/${this.secFileModel.id}/analysis/${this.secAnalysis.id}`
          )
        );

      assert
        .dom('[data-test-securityAnalysisDetailsHeader-analysisStatusInfoText]')
        .exists()
        .containsText('Analysis Status')
        .containsText(
          'Changing the status here will change the current status for this analysis in the file page.'
        );

      // CHECK FOR ANALYSIS STATUS
      const analysisStatusSelectTrigger = `[data-test-securityAnalysisDetailsHeader-analysisStatusSelector] .${AkSelectClasses.trigger}`;

      // open scan status select
      await click(analysisStatusSelectTrigger);

      // Check default selected
      const analysisStatusSelectOptions = findAll('.ember-power-select-option');
      const selectedOptionIdx = ENUMS.ANALYSIS_STATUS.CHOICES.findIndex(
        (s) => s.value === this.secAnalysis.status
      );

      assert
        .dom(analysisStatusSelectOptions[selectedOptionIdx])
        .hasAria('selected', 'true')
        .containsText(analysisStatusTextMap[this.secAnalysis.status]);
    }
  );

  test('it marks a test case as passed', async function (assert) {
    this.secAnalysis.set('cvssVersion', 4);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('cvssMetrics', PASSED_CVSS_V4_METRICS);

    this.server.get('/cvss', () => {
      return {
        cvss_base: 0,
        risk: ENUMS.RISK.NONE,
      };
    });

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert.dom('[data-test-securityAnalysisDetails-header-container]').exists();

    assert
      .dom('[data-test-securityAnalysisDetailsHeader-markAsPassedBtn]')
      .exists()
      .hasText('Mark as Passed');

    await click('[data-test-securityAnalysisDetailsHeader-markAsPassedBtn]');

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .containsText('Are you sure you want to mark this analysis as passed?');

    await click('[data-test-confirmbox-confirmBtn]');

    assert
      .dom('[data-test-securityAnalysisDetailsHeader-markAsPassedBtn]')
      .doesNotExist();

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBaseAndRisk]')
      .exists()
      .containsText('0')
      .containsText(riskText([ENUMS.RISK.NONE])); // Should be passed risk
  });

  test.each(
    'test: cvss metrics',
    [
      {
        label: 'Attack Vector',
        key: 'attack_vector',
        enumGroup: ENUMS.CVSS_V4_ATTACK_VECTOR,
        currValue: ENUMS.CVSS_V4_ATTACK_VECTOR.ADJACENT,
        nextVal: ENUMS.CVSS_V4_ATTACK_VECTOR.LOCAL,
        cvssBase: 1.2,
        cvssRisk: ENUMS.RISK.LOW,
        valueChoices: ENUMS.CVSS_V4_ATTACK_VECTOR.VALUES,
      },
      {
        label: 'Attack Complexity',
        key: 'attack_complexity',
        enumGroup: ENUMS.CVSS_V4_ATTACK_COMPLEXITY,
        currValue: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.HIGH,
        nextVal: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.LOW,
        cvssBase: 3.3,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.VALUES,
      },
      {
        label: 'Attack Requirements',
        key: 'attack_requirements',
        enumGroup: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS,
        currValue: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.PRESENT,
        nextVal: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.NONE,
        cvssBase: 5.2,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.VALUES,
      },
      {
        label: 'Privileges Required',
        key: 'privileges_required',
        enumGroup: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED,
        currValue: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.HIGH,
        nextVal: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.LOW,
        cvssBase: 9.2,
        cvssRisk: ENUMS.RISK.CRITICAL,
        valueChoices: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.VALUES,
      },
      {
        label: 'User Interaction',
        key: 'user_interaction',
        enumGroup: ENUMS.CVSS_V4_USER_INTERACTION,
        currValue: ENUMS.CVSS_V4_USER_INTERACTION.ACTIVE,
        nextVal: ENUMS.CVSS_V4_USER_INTERACTION.NONE,
        cvssBase: 8.9,
        cvssRisk: ENUMS.RISK.CRITICAL,
        valueChoices: ENUMS.CVSS_V4_USER_INTERACTION.VALUES,
      },
      {
        label: 'Vulnerable Confidentiality Impact',
        key: 'vuln_confidentiality',
        enumGroup: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT,
        currValue: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.HIGH,
        nextVal: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.NONE,
        cvssBase: 4.3,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.VALUES,
      },
      {
        label: 'Vulnerable Integrity Impact',
        key: 'vuln_integrity',
        enumGroup: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT,
        currValue: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.HIGH,
        nextVal: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.UNKNOWN,
        cvssBase: 5.4,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.VALUES,
        isInvalidCvssMetric: true,
      },
      {
        label: 'Vulnerable Availability Impact',
        key: 'vuln_availability',
        enumGroup: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT,
        currValue: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.LOW,
        nextVal: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.UNKNOWN,
        cvssBase: 7.6,
        cvssRisk: ENUMS.RISK.HIGH,
        valueChoices: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.VALUES,
        isInvalidCvssMetric: true,
      },
      {
        label: 'Subsequent Confidentiality Impact',
        key: 'subsequent_confidentiality',
        enumGroup: ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT,
        currValue: ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.HIGH,
        nextVal: ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.NONE,
        cvssBase: 6.1,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.VALUES,
      },
      {
        label: 'Subsequent Integrity Impact',
        key: 'subsequent_integrity',
        enumGroup: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT,
        currValue: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.HIGH,
        nextVal: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.LOW,
        cvssBase: 7.3,
        cvssRisk: ENUMS.RISK.HIGH,
        valueChoices: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.VALUES,
      },
      {
        label: 'Subsequent Availability Impact',
        key: 'subsequent_availability',
        enumGroup: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT,
        currValue: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.HIGH,
        nextVal: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.LOW,
        cvssBase: 8.1,
        cvssRisk: ENUMS.RISK.CRITICAL,
        valueChoices: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.VALUES,
      },
    ],
    async function (
      assert,
      {
        label,
        key,
        currValue,
        nextVal,
        cvssBase,
        cvssRisk,
        valueChoices,
        enumGroup,
        isInvalidCvssMetric,
      }
    ) {
      // Set the server to return V4 data with currValue for the tested metric
      const cvssMetrics = { ...PASSED_CVSS_V4_METRICS, [key]: currValue };

      this.server.db['security/analyses'].update(this.secAnalysis.id, {
        cvss_version: 4,
        active_cvss_version: 4,
        cvss_metrics: cvssMetrics,
      });

      this.secAnalysis.set('cvssVersion', 4);
      this.secAnalysis.set('activeCvssVersion', 4);
      this.secAnalysis.set('cvssMetrics', cvssMetrics);

      this.server.get('/cvss', () => {
        return {
          cvss_base: cvssBase,
          risk: cvssRisk,
        };
      });

      await render(
        hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
      );

      assert
        .dom('[data-test-securityAnalysisDetails-header-container]')
        .exists();

      assert
        .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBaseAndRisk]')
        .exists()
        .containsText(String(this.secAnalysis.cvssBase))
        .containsText(riskText([this.secAnalysis.risk]));

      // CHECK FOR CVSS METRIC LABEL
      assert
        .dom(
          `[data-test-securityAnalysisDetails-cvssMetrics-metricSelectLabel='${key}']`
        )
        .exists()
        .hasText(label);

      // CHECK FOR CVSS METRIC
      const cvssMetricSelectTrigger = `[data-test-securityAnalysisDetails-cvssMetrics-metricSelect='${key}'] .${AkSelectClasses.trigger}`;

      // open cvss metric select
      await click(cvssMetricSelectTrigger);

      // Check default selected
      let cvssMetricSelectOptions = findAll('.ember-power-select-option');
      const selectedOptionIdx = valueChoices.indexOf(currValue);

      assert
        .dom(cvssMetricSelectOptions[selectedOptionIdx])
        .hasAria('selected', 'true')
        .containsText(getMetricLabel(enumGroup, currValue));

      // Select next metric value
      const nextMetricValueIndex = valueChoices.indexOf(nextVal);
      const nextMetricValue = valueChoices[nextMetricValueIndex];
      const nextMetricValueLabel = getMetricLabel(enumGroup, nextVal);

      await selectChoose(
        cvssMetricSelectTrigger,
        nextMetricValue === -1 ? nextMetricValueLabel : nextMetricValue // Check for unknown scenario
      );

      // open cvss metric select
      await click(cvssMetricSelectTrigger);

      // Affirm next metric value is selected
      cvssMetricSelectOptions = findAll('.ember-power-select-option');

      assert
        .dom(cvssMetricSelectOptions[nextMetricValueIndex])
        .hasAria('selected', 'true')
        .containsText(nextMetricValueLabel);

      if (isInvalidCvssMetric) {
        assert
          .dom(
            '[data-test-securityAnalysisDetails-cvssMetrics-invalidCvssBaseIcon]'
          )
          .exists();

        assert
          .dom(
            '[data-test-securityAnalysisDetails-cvssMetrics-invalidCvssBase]'
          )
          .exists()
          .containsText('Invalid vector');
      } else {
        // Checks the assigned cvss base and risk from the cvss endpoint ('/cvss')
        assert
          .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBase]')
          .exists()
          .containsText(String(cvssBase));

        assert
          .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssRisk]')
          .exists()
          .containsText(riskText([cvssRisk]));
      }
    }
  );

  test('it sets cvss metric as "UNTESTED"', async function (assert) {
    assert.expect();

    const cvssBase = -1.0;
    const cvssRisk = ENUMS.RISK.UNKNOWN;

    // Set the server to return V4 data so the V4 CVSS panel is active
    this.server.db['security/analyses'].update(this.secAnalysis.id, {
      cvss_version: 4,
      active_cvss_version: 4,
      cvss_metrics: { ...PASSED_CVSS_V4_METRICS },
    });

    this.secAnalysis.set('cvssVersion', 4);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('cvssMetrics', { ...PASSED_CVSS_V4_METRICS });

    this.server.put('/hudson-api/analyses/:id', (schema, req) => {
      const untestedCvssV4State = {
        attack_vector: ENUMS.CVSS_V4_ATTACK_VECTOR.UNKNOWN,
        attack_complexity: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.UNKNOWN,
        attack_requirements: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.UNKNOWN,
        privileges_required: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.UNKNOWN,
        user_interaction: ENUMS.CVSS_V4_USER_INTERACTION.UNKNOWN,
        vuln_confidentiality: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.UNKNOWN,
        vuln_integrity: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.UNKNOWN,
        vuln_availability: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.UNKNOWN,
        subsequent_confidentiality:
          ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.UNKNOWN,
        subsequent_integrity: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.UNKNOWN,
        subsequent_availability:
          ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.UNKNOWN,
      };

      const data = JSON.parse(req.requestBody);

      // Sanity check: V4 untested metrics go into active_cvss_vector_fields
      Object.keys(untestedCvssV4State).forEach((key) =>
        assert.strictEqual(
          untestedCvssV4State[key],
          data.active_cvss_vector_fields?.[key],
          `API CHECK: "${key}" is sent correctly in active_cvss_vector_fields.`
        )
      );

      assert.strictEqual(
        ENUMS.RISK.UNKNOWN,
        data.risk,
        'API CHECK: "risk" is sent correctly.'
      );

      schema.db['security/analyses'].update(req.params.id, data);

      return schema['security/analyses'].find(req.params.id).toJSON();
    });

    this.server.get('/cvss', () => {
      return {
        cvss_base: cvssBase,
        risk: cvssRisk,
      };
    });

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert.dom('[data-test-securityAnalysisDetails-header-container]').exists();

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBaseAndRisk]')
      .exists()
      .containsText(String(this.secAnalysis.cvssBase))
      .containsText(riskText([this.secAnalysis.risk]));

    // Trigger untested button
    await click(
      '[data-test-securityAnalysisDetails-cvssMetrics-setUntestedBtn]'
    );

    const metricKeys = [
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
    ];

    for (const metricKey of metricKeys) {
      const EXPECTED_SELECTED_OPTION_LABEL = 'UNKNOWN';

      // CHECK FOR CVSS METRIC
      const cvssMetricSelectTrigger = `[data-test-securityAnalysisDetails-cvssMetrics-metricSelect='${metricKey}'] .${AkSelectClasses.trigger}`;

      // open cvss metric select
      await click(cvssMetricSelectTrigger);

      // Check default selected
      let cvssMetricSelectOptions = findAll('.ember-power-select-option');

      assert
        .dom(cvssMetricSelectOptions.slice(-1)[0]) // 'Unknown' option is always the last by ENUM value choices
        .hasAria('selected', 'true')
        .containsText(EXPECTED_SELECTED_OPTION_LABEL);

      // close cvss metric select
      await click(cvssMetricSelectTrigger);
    }

    // After setting to untested, the panel shows isEmpty state (base = -1, no score display)
    // The /cvss endpoint is NOT called when isEmpty = true (recalculateCVSSScore exits early)
    // We verify the untested state indirectly via the save action below

    await click(
      '[data-test-securityAnalysisDetails-footer-saveAndContinueBtn]'
    );
  });

  test.each(
    'it renders respective analysis details regulatory contents',
    [
      ['withOwasp', 'owasp', 'OWASP Category', ['code', 'year', 'title']],
      [
        'withOwaspMobile2024',
        'owaspmobile2024',
        'OWASP Mobile Top 10 (2024)',
        ['code', 'year', 'title'],
      ],
      [
        'withOwaspApi2023',
        'owaspapi2023',
        'OWASP API TOP 10 (2023)',
        ['code', 'title'],
      ],
      ['withPcidss', 'pcidss', 'PCI-DSS Risk Category', ['code', 'title']],
      [
        'withPcidss4',
        'pcidss4',
        'PCI-DSS Risk Category (v 4.0)',
        ['code', 'title'],
      ],
      ['withHipaa', 'hipaa', 'HIPAA Sections', ['code', 'safeguard', 'title']],
      [
        'withMasvs',
        'masvs',
        'OWASP MASVS (v2) Requirements',
        ['code', 'title'],
      ],
      ['withMstg', 'mstg', 'MSTG Requirements', ['code', 'title']],
      ['withAsvs', 'asvs', 'ASVS Requirements', ['code', 'title']],
      ['withCwe', 'cwe', ' CWE Weaknesses', ['code', 'url']],
      ['withGdpr', 'gdpr', 'GDPR Articles', ['code', 'title']],
      [
        'withNistsp800171',
        'nistsp800171',
        'NIST SP 800-171',
        ['code', 'title'],
      ],
      ['withNistsp80053', 'nistsp80053', 'NIST SP 800-53', ['code', 'title']],
      [
        'withSama',
        'sama',
        'Saudi Arabian Monetary Authority',
        ['code', 'title'],
      ],
    ],
    async function (
      assert,
      [trait, valueKey, title, selectOptLabelConstructKeys]
    ) {
      this.server.createList(valueKey, 1);

      this.secAnalysis = this.store.push(
        this.store.normalize(
          'security/analysis',
          this.server
            .create('security/analysis', trait, {
              vulnerability: this.vulnerabilityModel.id,
              file: this.secFileModel.id,
              risk: ENUMS.RISK.HIGH,
            })
            .toJSON()
        )
      );

      await render(
        hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
      );

      assert
        .dom('[data-test-securityAnalysisDetails-regulatoryCategories-header]')
        .exists()
        .containsText('Regulatory Categories');

      const reguatorySectionContainer = `[data-test-securityAnalysisDetails-regulatoryCategories='${valueKey}']`;

      assert
        .dom(
          `${reguatorySectionContainer} [data-test-securityAnalysisDetails-regulatorySection-title] `
        )
        .exists()
        .hasText(title);

      const regulatorySelectTrigger = `${reguatorySectionContainer} [data-test-securityAnalysisDetails-regulatoryCategories-select] .${AkSelectClasses.trigger}`;

      await click(regulatorySelectTrigger);

      // Check default selected
      let regulatorySelectOptions = findAll('.ember-power-select-option');

      const selectedOptions = (await this.secAnalysis.get(valueKey)).slice();

      selectedOptions.forEach((op) => {
        const optionLabelParts = selectOptLabelConstructKeys
          .map((k) => op[k])
          .join(' - ');

        const element = regulatorySelectOptions.find((opt) => {
          return opt.innerText
            .toLowerCase()
            .includes(optionLabelParts.toLowerCase());
        });

        assert.dom(element).exists().hasAria('selected', 'true');
      });
    }
  );

  test.each(
    'it adds, downloads, and deletes an attachment to analysis',
    [
      { ext: 'apk', fail: false },
      { ext: 'html', fail: false },
      { ext: 'apk', fail: true },
    ],
    async function (assert, { ext, fail }) {
      const NEW_ATTACHMENT_ID = 1;
      const fileName = `${faker.string.alphanumeric(10)}.${ext}`;
      const downloadURL = `https://www.download.com/${fileName}`;

      this.server.post('/hudson-api/attachments', () => {
        if (fail) {
          return new Response(400, {}, { detail: 'Network Error' });
        }

        return {
          file_uuid: faker.string.uuid(),
          file_key: fileName,
          file_key_signed: fileName,
          url: downloadURL,
        };
      });

      this.server.put(downloadURL, () => new Response(200, {}));

      this.server.delete('/hudson-api/attachments/:id', (schema) => {
        // Delete Added attachment
        schema.db['security/analyses'].update(this.secAnalysis.id, {
          attachments: [],
        });

        return new Response(200, {});
      });

      this.server.put('/hudson-api/analyses/:id', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        schema.db['security/analyses'].update(req.params.id, data);

        return schema['security/analyses'].find(req.params.id).toJSON();
      });

      this.server.get('/hudson-api/attachments/:id', (schema, req) => {
        return schema['security/attachments'].find(req.params.id).toJSON();
      });

      this.server.get('/hudson-api/attachments/:id/download', () => ({
        url: downloadURL,
      }));

      this.server.post(
        '/hudson-api/attachments/upload_finished',
        (schema, req) => {
          const reqBody = JSON.parse(req.requestBody);

          // Create an attachment
          const attachment = this.server.create('security/attachment', {
            id: NEW_ATTACHMENT_ID,
            ...reqBody,
          });

          // Add attachment to analysis
          schema['security/analyses']
            .find(reqBody.analysis)
            .update({ attachments: [attachment.id] });

          return new Response(200, attachment);
        }
      );

      await render(
        hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
      );

      assert
        .dom('[data-test-securityAnalysisDetails-attachments-header]')
        .exists()
        .containsText('Attachments')
        .containsText('Files relevant to this analysis');

      const emptyFileListSelector =
        '[data-test-securityAnalysisDetails-attachments-emptyUploadMessage]';

      assert
        .dom(emptyFileListSelector)
        .exists()
        .containsText('No Files Uploaded');

      assert
        .dom(
          '[data-test-securityAnalysisDetails-attachments-uploadFileTrigger]'
        )
        .exists()
        .containsText('Upload File');

      // Creates a new file with extension
      const file = new File(['Test file'], fileName, { type: ext });

      await selectFiles(
        '[data-test-securityAnalysisDetails-attachments-uploadFileInput]',
        file
      );

      const notify = this.owner.lookup('service:notifications');

      if (!fail) {
        assert.dom(emptyFileListSelector).doesNotExist();
        assert.strictEqual(notify.successMsg, 'File Uploaded Successfully');

        // Sanity check for newly added attachment
        const newAttachment = this.store.push(
          this.store.normalize(
            'security/attachment',
            this.server.db['security/attachments'].find(NEW_ATTACHMENT_ID)
          )
        );

        const attachmentSelector = `[data-test-securityAnalysisDetails-attachments-uploadedFile='${newAttachment.id}']`;

        assert
          .dom(
            `${attachmentSelector} [data-test-securityAnalysisDetails-attachments-uploadedFile-extension]`
          )
          .exists()
          .hasAttribute('data-type', fileExtension([newAttachment.name]));

        assert
          .dom(
            `${attachmentSelector} [data-test-securityAnalysisDetails-attachments-uploadedFile-name]`
          )
          .exists()
          .hasText(newAttachment.name);

        // DOWNLOAD FILE ACTION
        await click(
          `${attachmentSelector} [data-test-securityAnalysisDetails-attachments-uploadedFile-downloadBtn]`
        );

        const window = this.owner.lookup('service:browser/window');

        assert.strictEqual(window.url, downloadURL);
        assert.strictEqual(window.target, '_blank');

        // DELETE FILE ACTION
        await click(
          `${attachmentSelector} [data-test-securityAnalysisDetails-attachments-uploadedFile-deleteBtn]`
        );

        assert
          .dom('[data-test-ak-modal-header]')
          .exists()
          .containsText('Are you sure you want to remove this file?');

        await click('[data-test-confirmbox-confirmBtn]');

        assert.strictEqual(notify.successMsg, 'File Deleted Successfully');

        assert
          .dom(emptyFileListSelector)
          .exists()
          .containsText('No Files Uploaded');
      } else {
        assert.strictEqual(notify.errorMsg, 'Network Error');

        assert
          .dom(emptyFileListSelector)
          .exists()
          .containsText('No Files Uploaded');
      }
    }
  );

  test.each(
    'it adds, edits, and clears analysis findings',
    [{ edit: true }, { add: true }, { clear: true }],
    async function (assert, { edit, add, clear }) {
      assert.expect();

      const findings = this.secAnalysis
        .get('findings')
        .map((finding, index) => ({
          ...finding,
          id: index + 1,
        }));

      const testData = {
        editCase: {
          id: findings[0].id,
          title: 'EDITED TITLE',
          description: 'EDITED DESCRIPTION',
        },
        addCase: {
          title: 'NEW TITLE',
          description: 'NEW DESCRIPTION',
          id: findings.length + 1,
        },
      };

      // Server Mocks
      this.server.put('/hudson-api/analyses/:id', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        if (clear) {
          // assertions to ensure findings is an empty array
          assert.ok(
            data.findings.length,
            0,
            'API CHECK: empty list is sent to API'
          );
        } else if (add) {
          // assertions to ensure findings contain newly added finding
          const newFinding = data.findings.find(
            (f) => f.title === testData.addCase.title
          );

          assert.deepEqual(
            newFinding,
            testData.addCase,
            'API CHECK: new finding is sent to API'
          );
        } else if (edit) {
          // assertions to ensure a finding was edited successfully
          const editedFinding = data.findings.find(
            (f) => f.id === testData.editCase.id
          );

          assert.deepEqual(
            editedFinding,
            testData.editCase,
            'API CHECK: edited finding sent to API is edited accordingly'
          );
        }

        schema.db['security/analyses'].update(req.params.id, data);

        return schema['security/analyses'].find(req.params.id).toJSON();
      });

      await render(
        hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
      );

      const selectors = {
        findingsTable: '[data-test-securityAnalysisDetailsTable-row]',
        saveButton:
          '[data-test-securityAnalysisDetails-footer-saveAndContinueBtn]',
      };

      assert
        .dom('[data-test-securityAnalysisDetails-findings-infoTexts]')
        .exists()
        .containsText('Findings')
        .containsText(
          'All discoveries associated with this vulnerability analysis'
        );

      assert
        .dom('[data-test-securityAnalysisDetails-findings-clearAllFindingsBtn]')
        .exists()
        .containsText('Clear All Findings');

      // Verify initial findings state
      const getFindingElements = () => findAll(selectors.findingsTable);
      let allFindingElements = getFindingElements();

      assert.strictEqual(allFindingElements.length, findings.length);

      findings.forEach((finding) => {
        const title = finding.title;
        const description = finding.description;

        const findingRowElement = find(
          `[data-test-securityAnalysisDetailsTable-rowId='${finding.id}']`
        );

        assert
          .dom(
            '[data-test-securityAnalysisDetails-findingTitle]',
            findingRowElement
          )
          .exists()
          .hasValue(title);

        assert
          .dom(
            '[data-test-securityAnalysisDetails-findingDescription]',
            findingRowElement
          )
          .exists()
          .hasValue(description);

        assert
          .dom(
            '[data-test-securityAnalysisDetails-findingDeleteIconBtn]',
            findingRowElement
          )
          .exists();
      });

      if (add) {
        // ADD A FINDING
        assert
          .dom('[data-test-securityAnalysisDetails-newHeaderText]')
          .exists()
          .containsText('New Finding?');

        assert
          .dom('[data-test-securityAnalysisDetails-newFindingTitleInput]')
          .exists();

        assert
          .dom('[data-test-securityAnalysisDetails-newFindingDescriptionInput]')
          .exists();

        assert
          .dom('[data-test-securityAnalysisDetails-newFindingAddBtn]')
          .exists()
          .hasText('Add Finding');

        // Add new finding
        await fillIn(
          '[data-test-securityAnalysisDetails-newFindingTitleInput]',
          testData.addCase.title
        );

        await fillIn(
          '[data-test-securityAnalysisDetails-newFindingDescriptionInput]',
          testData.addCase.description
        );

        await click('[data-test-securityAnalysisDetails-newFindingAddBtn]');

        await click(selectors.saveButton);

        assert.strictEqual(getFindingElements().length, findings.length + 1);
      }

      if (clear) {
        // CLEAR ALL FINDINGS
        await click(
          '[data-test-securityAnalysisDetails-findings-clearAllFindingsBtn]'
        );

        assert
          .dom('[data-test-ak-modal-header]')
          .exists()
          .containsText('Are you sure you want to clear all findings?');

        await click('[data-test-confirmbox-confirmBtn]');

        // Finding will return to its original length
        assert.strictEqual(getFindingElements().length, 0);
      }

      if (edit) {
        const rowSelector = `[data-test-securityAnalysisDetailsTable-rowId='${testData.editCase.id}']`;

        await fillIn(
          `${rowSelector} [data-test-securityAnalysisDetails-findingTitle]`,
          testData.editCase.title
        );

        await fillIn(
          `${rowSelector} [data-test-securityAnalysisDetails-findingDescription]`,
          testData.editCase.description
        );

        assert
          .dom(
            `${rowSelector} [data-test-securityAnalysisDetails-findingTitle]`
          )
          .hasValue(testData.editCase.title);

        assert
          .dom(
            `${rowSelector} [data-test-securityAnalysisDetails-findingDescription]`
          )
          .hasValue(testData.editCase.description);

        await click(selectors.saveButton);
      }
    }
  );

  test('it deletes an analysis finding', async function (assert) {
    assert.expect();

    const findings = this.secAnalysis.get('findings').map((finding, index) => ({
      ...finding,
      id: index + 1,
    }));

    const FINDING_ID_TO_DELETE = findings[0].id;

    // Server Mocks
    this.server.put('/hudson-api/analyses/:id', (schema, req) => {
      const data = JSON.parse(req.requestBody);

      // check if deleted file is part of network request
      assert.strictEqual(
        data.findings.find((f) => f.id === FINDING_ID_TO_DELETE),
        undefined,
        'API CHECK: deleted finding is not sent over the network'
      );

      schema.db['security/analyses'].update(req.params.id, data);

      return schema['security/analyses'].find(req.params.id).toJSON();
    });

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert
      .dom('[data-test-securityAnalysisDetails-findings-infoTexts]')
      .exists()
      .containsText('Findings')
      .containsText(
        'All discoveries associated with this vulnerability analysis'
      );

    assert
      .dom('[data-test-securityAnalysisDetails-findings-clearAllFindingsBtn]')
      .exists()
      .containsText('Clear All Findings');

    let allFindingElements = findAll(
      '[data-test-securityAnalysisDetailsTable-row]'
    );

    assert.strictEqual(allFindingElements.length, findings.length);

    // DELETE A FINDING
    const rowElementToDelete = `[data-test-securityAnalysisDetailsTable-rowId='${FINDING_ID_TO_DELETE}']`;

    assert
      .dom(
        `${rowElementToDelete} [data-test-securityAnalysisDetails-findingDeleteIconBtn]`
      )
      .exists();

    await click(
      `${rowElementToDelete} [data-test-securityAnalysisDetails-findingDeleteIconBtn]`
    );

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .containsText('Are you sure you want to remove this finding?');

    // confirm delete
    await click('[data-test-confirmbox-confirmBtn]');

    allFindingElements = findAll(
      '[data-test-securityAnalysisDetailsTable-row]'
    );

    // Finding will return to its original length
    assert.strictEqual(allFindingElements.length, findings.length - 1);
  });

  // ── Header: legacy CVSS version guard (header changes) ───────────────────────

  test('it shows the "Mark as Passed" button as disabled when the analysis has a legacy CVSS version', async function (assert) {
    this.secAnalysis.set('cvssVersion', 3);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('risk', ENUMS.RISK.HIGH);

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert
      .dom('[data-test-securityAnalysisDetailsHeader-markAsPassedBtn]')
      .exists('Mark as Passed button is shown even for legacy analysis')
      .isDisabled(
        'Mark as Passed button is disabled when CVSS version is legacy'
      );
  });

  test('it shows the "Mark as Passed" button as enabled when the analysis CVSS version matches the active version', async function (assert) {
    this.secAnalysis.set('cvssVersion', 4);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('cvssMetrics', PASSED_CVSS_V4_METRICS);
    this.secAnalysis.set('risk', ENUMS.RISK.HIGH);

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert
      .dom('[data-test-securityAnalysisDetailsHeader-markAsPassedBtn]')
      .exists('Mark as Passed button is shown for a non-legacy analysis')
      .isNotDisabled(
        'Mark as Passed button is enabled when CVSS versions match'
      );
  });

  // ── Legacy CVSS banner & accordion (cvss-metrics changes) ────────────────────

  test('it shows the legacy CVSS banner when cvss_version !== active_cvss_version', async function (assert) {
    this.secAnalysis.set('cvssVersion', 3);
    this.secAnalysis.set('activeCvssVersion', 4);

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-legacyBanner]')
      .exists(
        'Legacy CVSS banner is shown when analysis uses a different CVSS version than the platform active version'
      );

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-legacyBanner]')
      .containsText(
        'This analysis uses CVSS v3',
        'Banner message mentions CVSS v3'
      );
  });

  test('it does not show the legacy CVSS banner when cvss_version is not the same as active_cvss_version', async function (assert) {
    this.secAnalysis.set('cvssVersion', 4);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('cvssMetrics', PASSED_CVSS_V4_METRICS);

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-legacyBanner]')
      .doesNotExist(
        'Legacy CVSS banner is absent when analysis CVSS version matches the platform active version'
      );
  });

  test('it renders the legacy CVSS info accordion with the correct title', async function (assert) {
    const legacyCvssVector = 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H';

    this.secAnalysis.set('cvssVersion', 3);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('cvssVector', legacyCvssVector);
    this.secAnalysis.set('legacyCvssBase', -1);
    this.secAnalysis.set('legacyCvssMetrics', null);
    this.secAnalysis.set('legacyCvssVector', '');
    this.secAnalysis.set('legacyCvssVersion', null);

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-legacyCvssInfo]')
      .exists('Legacy CVSS accordion is rendered');

    assert
      .dom(
        '[data-test-securityAnalysisDetails-cvssMetrics-legacyCvssInfo] [data-test-akAccordion-summaryText]'
      )
      .containsText('Legacy CVSS v3', 'Accordion title includes CVSS version')
      .containsText(legacyCvssVector, 'Accordion title includes the vector');
  });

  test('it expands the legacy CVSS accordion to show the legacy CVSS panel', async function (assert) {
    const legacyCvssBase = 7.5;

    this.secAnalysis.set('cvssVersion', 3);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('legacyCvssVersion', 3);
    this.secAnalysis.set('legacyCvssBase', legacyCvssBase);
    this.secAnalysis.set('legacyCvssRisk', ENUMS.RISK.HIGH);
    this.secAnalysis.set('legacyCvssMetrics', { ...DEFAULT_CVSS_V3_METRICS });

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    const legacyAccordion =
      '[data-test-securityAnalysisDetails-cvssMetrics-legacyCvssInfo]';

    const accordionContent = `${legacyAccordion} [data-test-ak-accordion-content-wrapper]`;

    assert
      .dom(accordionContent)
      .hasNoClass(/expanded/, 'Accordion is collapsed by default');

    await click(`${legacyAccordion} [data-test-ak-accordion-summary]`);

    assert
      .dom(accordionContent)
      .hasClass(/expanded/, 'Accordion expands after clicking summary');

    assert
      .dom(
        `${legacyAccordion} [data-test-securityAnalysisDetails-cvssMetrics-cvssBase]`
      )
      .hasText(String(legacyCvssBase), 'Legacy base score is displayed');

    assert
      .dom(
        `${legacyAccordion} [data-test-securityAnalysisDetails-cvssMetrics-cvssRisk]`
      )
      .containsText(
        riskText([ENUMS.RISK.HIGH]),
        'Legacy risk label is displayed'
      );

    const V3_METRIC_KEYS = [
      'attack_vector',
      'attack_complexity',
      'privileges_required',
      'user_interaction',
      'scope',
      'confidentiality_impact',
      'integrity_impact',
      'availability_impact',
    ];

    V3_METRIC_KEYS.forEach((key) => {
      assert
        .dom(
          `${legacyAccordion} [data-test-securityAnalysisDetails-cvssMetrics-metricSelectLabel="${key}"]`
        )
        .exists(`Metric select label for "${key}" is rendered`);
    });
  });

  test('it updates the legacy panel score when a v3 metric is changed (legacy CVSS present)', async function (assert) {
    const updatedCvssBase = 6.5;
    const updatedCvssRisk = ENUMS.RISK.MEDIUM;

    // analysis is v3 (legacy), platform expects v4 (active)

    this.secAnalysis.set('cvssVersion', 3);
    this.secAnalysis.set('activeCvssVersion', 4);
    this.secAnalysis.set('cvssMetrics', PASSED_CVSS_V4_METRICS);

    // legacy (v3) data — attack_vector starts as PHYSICAL
    this.secAnalysis.set('legacyCvssVersion', 3);
    this.secAnalysis.set('legacyCvssBase', 9.8);
    this.secAnalysis.set('legacyCvssRisk', ENUMS.RISK.CRITICAL);
    this.secAnalysis.set('legacyCvssMetrics', { ...PASSED_CVSS_V3_METRICS });

    this.server.get('/cvss', () => ({
      cvss_base: updatedCvssBase,
      risk: updatedCvssRisk,
    }));

    await render(
      hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
    );

    const legacyAccordion =
      '[data-test-securityAnalysisDetails-cvssMetrics-legacyCvssInfo]';

    // Expand the legacy accordion
    await click(`${legacyAccordion} [data-test-ak-accordion-summary]`);

    const legacyAttackVectorTrigger = `${legacyAccordion} [data-test-securityAnalysisDetails-cvssMetrics-metricSelect='attack_vector'] .${AkSelectClasses.trigger}`;

    // Open the attack_vector select to verify initial selection (PHYSICAL)
    await click(legacyAttackVectorTrigger);

    const initialOptions = findAll('.ember-power-select-option');
    const physicalIdx = ENUMS.CVSS_V3_ATTACK_VECTOR.VALUES.indexOf(
      ENUMS.CVSS_V3_ATTACK_VECTOR.PHYSICAL
    );

    assert
      .dom(initialOptions[physicalIdx])
      .hasAria('selected', 'true', 'PHYSICAL is initially selected');

    // Change attack_vector from PHYSICAL to NETWORK
    await selectChoose(
      legacyAttackVectorTrigger,
      ENUMS.CVSS_V3_ATTACK_VECTOR.NETWORK
    );

    // Legacy panel should reflect updated score from /cvss
    assert
      .dom(
        `${legacyAccordion} [data-test-securityAnalysisDetails-cvssMetrics-cvssBase]`
      )
      .containsText(
        String(updatedCvssBase),
        'Legacy base score updates after v3 metric change'
      );

    assert
      .dom(
        `${legacyAccordion} [data-test-securityAnalysisDetails-cvssMetrics-cvssRisk]`
      )
      .containsText(
        riskText([updatedCvssRisk]),
        'Legacy risk updates after v3 metric change'
      );
  });

  // ── Save restrictions when legacy CVSS is present ────────────────────────────

  test.each(
    'it enforces v4 metric requirement before saving a legacy CVSS analysis',
    [
      {
        label: 'empty v4 metrics (all UNKNOWN)',
        v4Metrics: DEFAULT_CVSS_V4_METRICS,
        expectBlocked: true,
      },
      {
        label: 'valid v4 metrics provided',
        v4Metrics: PASSED_CVSS_V4_METRICS,
        expectBlocked: false,
      },
    ],
    async function (assert, { v4Metrics, expectBlocked }) {
      // Legacy fields are not returned by the Mirage factory so .set() persists
      // through the component's { reload: true } findRecord call.
      this.secAnalysis.set('legacyCvssVersion', 3);
      this.secAnalysis.set('legacyCvssBase', 9.8);
      this.secAnalysis.set('legacyCvssRisk', ENUMS.RISK.CRITICAL);
      this.secAnalysis.set('legacyCvssMetrics', PASSED_CVSS_V3_METRICS);

      if (expectBlocked) {
        // Legacy analysis: cvssVersion < activeCvssVersion triggers the v4 check
        this.server.db['security/analyses'].update(this.secAnalysis.id, {
          cvss_version: 3,
          active_cvss_version: 4,
        });

        this.secAnalysis.set('cvssVersion', 3);
        this.secAnalysis.set('activeCvssVersion', 4);
      } else {
        // Current v4 analysis: hydrateCVSSV4State runs and fills valid v4 metrics
        this.server.db['security/analyses'].update(this.secAnalysis.id, {
          cvss_version: 4,
          active_cvss_version: 4,
          cvss_metrics: { ...v4Metrics },
        });

        this.secAnalysis.set('cvssVersion', 4);
        this.secAnalysis.set('activeCvssVersion', 4);
        this.secAnalysis.set('cvssMetrics', { ...v4Metrics });

        this.server.put('/hudson-api/analyses/:id', (schema, req) => {
          const data = JSON.parse(req.requestBody);
          schema.db['security/analyses'].update(req.params.id, data);
          return schema['security/analyses'].find(req.params.id).toJSON();
        });
      }

      await render(
        hbs`<Security::AnalysisDetails @analysisDetails={{this.secAnalysis}} />`
      );

      await click(
        '[data-test-securityAnalysisDetails-footer-saveAndContinueBtn]'
      );

      const notify = this.owner.lookup('service:notifications');

      if (expectBlocked) {
        assert.ok(
          notify.errorMsg?.includes(
            'Please first provide a valid CVSS v4 metric'
          ),
          'Save is blocked with a v4 metric requirement error'
        );
      } else {
        assert.strictEqual(
          notify.successMsg,
          'Analysis Updated',
          'Save succeeds and shows the updated confirmation'
        );
      }
    }
  );
});
