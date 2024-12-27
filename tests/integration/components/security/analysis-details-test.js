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

import { metricImpact } from 'irene/helpers/metric-impact';
import { metricVector } from 'irene/helpers/metric-vector';
import { metricScope } from 'irene/helpers/metric-scope';
import { metricInteraction } from 'irene/helpers/metric-interaction';
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
        hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
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
        .containsText('Visit Dashboard')
        .hasAttribute('target', '_blank')
        .hasAttribute(
          'href',
          RegExp(`/dashboard/file/${this.secAnalysis.id}`, 'i')
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
    this.secAnalysis = this.store.push(
      this.store.normalize(
        'security/analysis',
        this.server.create('security/analysis', {
          vulnerability: this.vulnerabilityModel.id,
          file: this.secFileModel.id,
          risk: ENUMS.RISK.HIGH,
        })
      )
    );

    this.server.get('/cvss', () => {
      return {
        cvss_base: 0,
        risk: ENUMS.RISK.NONE,
      };
    });

    await render(
      hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
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
      .containsText(this.secAnalysis.cvssBase)
      .containsText(riskText([ENUMS.RISK.NONE])); // Should be passed risk
  });

  test.each(
    'test: cvss metrics',
    [
      {
        label: 'Attack Vector',
        key: 'attackVector',
        optionLabelGetter: metricVector,
        currValue: ENUMS.ATTACK_VECTOR.ADJACENT,
        nextVal: ENUMS.ATTACK_VECTOR.LOCAL,
        cvssBase: 1.2,
        cvssRisk: ENUMS.RISK.LOW,
        valueChoices: ENUMS.ATTACK_VECTOR.VALUES,
      },
      {
        label: 'Attack Complexity',
        key: 'attackComplexity',
        optionLabelGetter: metricImpact,
        currValue: ENUMS.ATTACK_COMPLEXITY.HIGH,
        nextVal: ENUMS.ATTACK_COMPLEXITY.LOW,
        cvssBase: 3.3,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.ATTACK_COMPLEXITY.VALUES,
      },
      {
        label: 'Privileges Required',
        key: 'privilegesRequired',
        optionLabelGetter: metricImpact,
        currValue: ENUMS.PRIVILEGES_REQUIRED.NONE,
        nextVal: ENUMS.PRIVILEGES_REQUIRED.LOW,
        cvssBase: 9.2,
        cvssRisk: ENUMS.RISK.CRITICAL,
        valueChoices: ENUMS.PRIVILEGES_REQUIRED.VALUES,
      },
      {
        label: 'User Interaction',
        key: 'userInteraction',
        optionLabelGetter: metricInteraction,
        currValue: ENUMS.USER_INTERACTION.REQUIRED,
        nextVal: ENUMS.USER_INTERACTION.NOT_REQUIRED,
        cvssBase: 8.9,
        cvssRisk: ENUMS.RISK.CRITICAL,
        valueChoices: ENUMS.USER_INTERACTION.VALUES,
      },
      {
        label: 'Scope',
        key: 'scope',
        optionLabelGetter: metricScope,
        currValue: ENUMS.SCOPE.CHANGED,
        nextVal: ENUMS.SCOPE.UNCHANGED,
        cvssBase: 7.3,
        cvssRisk: ENUMS.RISK.HIGH,
        valueChoices: ENUMS.SCOPE.VALUES,
      },

      {
        label: 'Confidentiality Impact',
        key: 'confidentialityImpact',
        optionLabelGetter: metricImpact,
        currValue: ENUMS.CONFIDENTIALITY_IMPACT.HIGH,
        nextVal: ENUMS.CONFIDENTIALITY_IMPACT.NONE,
        cvssBase: 4.3,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.CONFIDENTIALITY_IMPACT.VALUES,
      },

      {
        label: 'Integrity Impact',
        key: 'integrityImpact',
        optionLabelGetter: metricImpact,
        currValue: ENUMS.INTEGRITY_IMPACT.HIGH,
        nextVal: ENUMS.INTEGRITY_IMPACT.UNKNOWN,
        cvssBase: 5.4,
        cvssRisk: ENUMS.RISK.MEDIUM,
        valueChoices: ENUMS.INTEGRITY_IMPACT.VALUES,
        isInvalidCvssMetric: true,
      },
      {
        label: 'Availability Impact',
        key: 'availabilityImpact',
        optionLabelGetter: metricImpact,
        currValue: ENUMS.AVAILABILITY_IMPACT.LOW,
        nextVal: ENUMS.AVAILABILITY_IMPACT.UNKNOWN,
        cvssBase: 7.6,
        cvssRisk: ENUMS.RISK.HIGH,
        valueChoices: ENUMS.AVAILABILITY_IMPACT.VALUES,
        isInvalidCvssMetric: true,
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
        optionLabelGetter,
        isInvalidCvssMetric,
      }
    ) {
      this.secAnalysis = this.store.push(
        this.store.normalize(
          'security/analysis',
          this.server.create('security/analysis', {
            vulnerability: this.vulnerabilityModel.id,
            file: this.secFileModel.id,
          })
        )
      );

      this.secAnalysis.set(key, currValue);

      this.server.get('/cvss', () => {
        return {
          cvss_base: cvssBase,
          risk: cvssRisk,
        };
      });

      await render(
        hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
      );

      assert
        .dom('[data-test-securityAnalysisDetails-header-container]')
        .exists();

      assert
        .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBaseAndRisk]')
        .exists()
        .containsText(this.secAnalysis.cvssBase)
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
      const selectedOptionIdx = valueChoices.indexOf(this.secAnalysis.get(key));

      assert
        .dom(cvssMetricSelectOptions[selectedOptionIdx])
        .hasAria('selected', 'true')
        .containsText(optionLabelGetter([currValue]));

      // Select next metric value
      const nextMetricValueIndex = valueChoices.indexOf(nextVal);
      const nextMetricValue = valueChoices[nextMetricValueIndex];
      const nextMetricValueLabel = optionLabelGetter([nextVal]);

      await selectChoose(
        cvssMetricSelectTrigger,
        nextMetricValue === -1 ? nextMetricValueLabel : nextMetricValue // Check for unknown scenario
      );

      // open cvss metric select
      await click(cvssMetricSelectTrigger);

      // Affirm next metric valus is selected
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
          .containsText(cvssBase);

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

    this.secAnalysis = this.store.push(
      this.store.normalize(
        'security/analysis',
        this.server.create('security/analysis', {
          vulnerability: this.vulnerabilityModel.id,
          file: this.secFileModel.id,
          risk: ENUMS.RISK.HIGH,
        })
      )
    );

    this.server.put('/hudson-api/analyses/:id', (schema, req) => {
      const untestedCvssState = {
        attack_vector: ENUMS.ATTACK_VECTOR.UNKNOWN,
        attack_complexity: ENUMS.ATTACK_COMPLEXITY.UNKNOWN,
        privileges_required: ENUMS.PRIVILEGES_REQUIRED.UNKNOWN,
        user_interaction: ENUMS.USER_INTERACTION.UNKNOWN,
        scope: ENUMS.SCOPE.UNKNOWN,
        confidentiality_impact: ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN,
        integrity_impact: ENUMS.INTEGRITY_IMPACT.UNKNOWN,
        availability_impact: ENUMS.AVAILABILITY_IMPACT.UNKNOWN,
        risk: ENUMS.RISK.UNKNOWN,
      };

      const data = JSON.parse(req.requestBody);

      // Sanity check for values sent to API
      Object.keys(untestedCvssState).forEach((key) =>
        assert.strictEqual(
          untestedCvssState[key],
          data[key],
          `API CHECK: "${key}" is sent correctly.`
        )
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
      hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
    );

    assert.dom('[data-test-securityAnalysisDetails-header-container]').exists();

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBaseAndRisk]')
      .exists()
      .containsText(this.secAnalysis.cvssBase)
      .containsText(riskText([this.secAnalysis.risk]));

    // Trigger untested button
    await click(
      '[data-test-securityAnalysisDetails-cvssMetrics-setUntestedBtn]'
    );

    const metricKeys = [
      'attackVector',
      'attackComplexity',
      'privilegesRequired',
      'userInteraction',
      'scope',
      'confidentialityImpact',
      'integrityImpact',
      'availabilityImpact',
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

    // Checks the assigned cvss base and risk from the cvss endpoint ('/cvss')
    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssBase]')
      .exists()
      .containsText(cvssBase);

    assert
      .dom('[data-test-securityAnalysisDetails-cvssMetrics-cvssRisk]')
      .exists()
      .containsText(riskText([cvssRisk]));

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
        hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
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

      // Create an analysis
      this.secAnalysis = this.store.push(
        this.store.normalize(
          'security/analysis',
          this.server
            .create('security/analysis', {
              vulnerability: this.vulnerabilityModel.id,
              file: this.secFileModel.id,
              risk: ENUMS.RISK.HIGH,
            })
            .toJSON()
        )
      );

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
        hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
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
      let file = new File(['Test  file'], fileName, {
        type: ext,
      });

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

      // Give each finding an ID
      let findingId = 0;

      const findings = this.secAnalysis.get('findings').map((finding) => {
        findingId = findingId + 1;
        finding.id = findingId;

        return finding;
      });

      // Finings Edit details
      const FINDING_ID_TO_EDIT = findings[0].id;
      const EDITED_TITLE = 'EDITED TITLE';
      const EDITED_DESCRIPTION = 'EDITED DESCRIPTION';

      // New finding details
      const NEW_TITLE = 'NEW TITLE';
      const NEW_DESCRIPTION = 'NEW DESCRIPTION';

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
          assert.deepEqual(
            data.findings.find((f) => f.title === NEW_TITLE),
            {
              title: NEW_TITLE,
              description: NEW_DESCRIPTION,
              id: findingId + 1,
            },
            'API CHECK: new finding is sent to API'
          );
        } else if (edit) {
          // assertions to ensure a finding was edited successfully
          assert.deepEqual(
            data.findings.find((f) => f.id === FINDING_ID_TO_EDIT),
            {
              title: EDITED_TITLE,
              description: EDITED_DESCRIPTION,
              id: FINDING_ID_TO_EDIT,
            },
            'API CHECK: edited finding sent to API is edited accordingly'
          );
        }

        schema.db['security/analyses'].update(req.params.id, data);

        return schema['security/analyses'].find(req.params.id).toJSON();
      });

      await render(
        hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
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
          .dom('[ data-test-securityAnalysisDetails-newFindingAddBtn]')
          .exists()
          .hasText('Add Finding');

        await fillIn(
          '[data-test-securityAnalysisDetails-newFindingTitleInput]',
          NEW_TITLE
        );

        await fillIn(
          '[data-test-securityAnalysisDetails-newFindingDescriptionInput]',
          NEW_DESCRIPTION
        );

        await click('[data-test-securityAnalysisDetails-newFindingAddBtn]');

        await click(
          '[data-test-securityAnalysisDetails-footer-saveAndContinueBtn]'
        );

        allFindingElements = findAll(
          '[data-test-securityAnalysisDetailsTable-row]'
        );

        assert.strictEqual(allFindingElements.length, findings.length + 1);
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

        allFindingElements = findAll(
          '[data-test-securityAnalysisDetailsTable-row]'
        );

        // Finding will return to its original length
        assert.strictEqual(allFindingElements.length, 0);
      }

      if (edit) {
        const rowElementToEdit = `[data-test-securityAnalysisDetailsTable-rowId='${FINDING_ID_TO_EDIT}']`;

        await fillIn(
          `${rowElementToEdit} [data-test-securityAnalysisDetails-findingTitle]`,
          EDITED_TITLE
        );

        await fillIn(
          `${rowElementToEdit} [data-test-securityAnalysisDetails-findingDescription]`,
          EDITED_DESCRIPTION
        );

        assert
          .dom(
            `${rowElementToEdit} [data-test-securityAnalysisDetails-findingTitle]`
          )
          .hasValue(EDITED_TITLE);

        assert
          .dom(
            `${rowElementToEdit} [data-test-securityAnalysisDetails-findingDescription]`
          )
          .hasValue(EDITED_DESCRIPTION);

        await click(
          '[data-test-securityAnalysisDetails-footer-saveAndContinueBtn]'
        );
      }
    }
  );

  test('it deletes an analysis finding', async function (assert) {
    assert.expect();

    // Give each finding an ID
    let findingId = 0;

    const findings = this.secAnalysis.get('findings').map((finding) => {
      findingId = findingId + 1;
      finding.id = findingId;

      return finding;
    });

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
      hbs`<Security::AnalysisDetails @analysisId={{this.secAnalysis.id}} />`
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
});
