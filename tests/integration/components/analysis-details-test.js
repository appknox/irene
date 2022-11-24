/* eslint-disable qunit/no-assert-equal, qunit/no-commented-tests */
import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';

class OrganizationStub extends Service {
  selected = {
    id: 1,
  };
}

module('Integration | Component | analysis details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);

    this.vulnerability = this.server.create('vulnerability');
    this.project = this.server.create('project', {
      id: 1,
      isManualScanAvailable: true,
    });

    this.profile = this.server.create('profile');
    this.file = this.server.create('file', {
      project: this.project,
      profile: this.profile,
    });
  });

  test('it expands details on header click', async function (assert) {
    const analysis = this.server.create('analysis', {
      file: this.file,
      vulnerability: this.vulnerability,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    assert.dom('[data-test-analysis-detail="body"]').doesNotExist();
    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);
    assert.dom('[data-test-analysis-detail="body"]').exists();
  });

  test('it does not render regulatories for passed risk', async function (assert) {
    const analysis = this.server.create('analysis', {
      file: this.file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.NONE,
      status: ENUMS.ANALYSIS.COMPLETED,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);
    assert.dom('[data-test-analysis-detail="regulatories"]').doesNotExist();
  });

  test('it does not render regulatories for untested risk', async function (assert) {
    const analysis = this.server.create('analysis', {
      file: this.file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.UNKNOWN,
      status: ENUMS.ANALYSIS.COMPLETED,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);
    assert.dom('[data-test-analysis-detail="regulatories"]').doesNotExist();
  });

  test('it does not render regulatories if analysis is not completed', async function (assert) {
    const analysis = this.server.create('analysis', {
      file: this.file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.UNKNOWN,
      status: ENUMS.ANALYSIS.WAITING,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );

    await click(header);
    assert.dom('[data-test-analysis-detail="regulatories"]').doesNotExist();

    this.analysis.status = ENUMS.ANALYSIS.RUNNING;
    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);
    await click(header);
    assert.dom('[data-test-analysis-detail="regulatories"]').doesNotExist();

    this.analysis.status = ENUMS.ANALYSIS.ERROR;
    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);
    await click(header);
    assert.dom('[data-test-analysis-detail="regulatories"]').doesNotExist();
  });

  test('it renders common regulatories by default', async function (assert) {
    const analysis = this.server.create('analysis', {
      file: this.file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.CRITICAL,
      status: ENUMS.ANALYSIS.COMPLETED,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);
    assert.dom('[data-test-analysis-detail="regulatories"]').exists();

    assert.dom('[data-test-regulatory="cvssv3"]').exists();
    assert.dom('[data-test-regulatory="owasp"]').exists();
    assert.dom('[data-test-regulatory="cwe"]').exists();
    assert.dom('[data-test-regulatory="asvs"]').exists();
    assert.dom('[data-test-regulatory="mstg"]').exists();
  });

  test('it renders optional regulatories based in profile regulatory preference', async function (assert) {
    const profile = this.server.create('profile', {
      reportPreference: {
        show_pcidss: {
          value: true,
          is_inherited: true,
        },
        show_hipaa: {
          value: false,
          is_inherited: true,
        },
        show_gdpr: {
          value: false,
          is_inherited: false,
        },
      },
    });
    const file = this.server.create('file', {
      profile: profile,
      project: this.project,
    });

    const analysis = this.server.create('analysis', {
      file: file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.CRITICAL,
      status: ENUMS.ANALYSIS.COMPLETED,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);

    assert.dom('[data-test-regulatory="pcidss"]').exists();
    assert.dom('[data-test-regulatory="hipaa"]').doesNotExist();
    assert.dom('[data-test-regulatory="gdpr"]').doesNotExist();
  });

  test('it renders regulatory name, code & detail as columns', async function (assert) {
    const profile = this.server.create('profile', {
      reportPreference: {
        show_pcidss: {
          value: true,
          is_inherited: true,
        },
        show_hipaa: {
          value: true,
          is_inherited: true,
        },
        show_gdpr: {
          value: true,
          is_inherited: false,
        },
      },
    });
    const file = this.server.create('file', {
      profile: profile,
      project: this.project,
    });

    const analysis = this.server.create('analysis', {
      file: file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.CRITICAL,
      status: ENUMS.ANALYSIS.COMPLETED,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);

    // CVSSv3
    const cvssv3Label = this.element.querySelector(
      '[data-test-regulatory-label="cvssv3"]'
    );
    const cvssv3Detail = this.element.querySelector(
      '[data-test-regulatory-detail="cvssv3"]'
    );
    assert.equal(cvssv3Label.innerHTML, 'CVSSv3');
    assert.equal(cvssv3Label.title, 't:cvssExpansion:()');
    assert.equal(cvssv3Label.clientHeight, cvssv3Detail.clientHeight);

    const cvssv3metricsLabel = this.element.querySelector(
      '[data-test-regulatory-label="cvssv3metrics"]'
    );
    const cvssv3metricsDetail = this.element.querySelector(
      '[data-test-regulatory-detail="cvssv3metrics"]'
    );
    assert.equal(cvssv3metricsLabel.innerHTML, 't:cvssMetrics:()');
    assert.equal(
      cvssv3metricsLabel.clientHeight,
      cvssv3metricsDetail.clientHeight
    );
    assert.dom('[data-test-cvssv3metrics-key="Attack Vector"]').exists();
    assert.dom('[data-test-cvssv3metrics-key="Attack Complexity"]').exists();
    assert.dom('[data-test-cvssv3metrics-key="Privileges Required"]').exists();
    assert.dom('[data-test-cvssv3metrics-key="User Interaction"]').exists();
    assert.dom('[data-test-cvssv3metrics-key="Scope"]').exists();
    assert
      .dom('[data-test-cvssv3metrics-key="Confidentiality Impact"]')
      .exists();
    assert.dom('[data-test-cvssv3metrics-key="Integrity Impact"]').exists();
    assert.dom('[data-test-cvssv3metrics-key="Availability Impact"]').exists();

    // OWASP
    const owaspLabel = this.element.querySelector(
      '[data-test-regulatory-label="owasp"]'
    );
    const owaspDetail = this.element.querySelector(
      '[data-test-regulatory-detail="owasp"]'
    );
    assert.equal(owaspLabel.innerHTML, 'OWASP');
    assert.equal(owaspLabel.title, 't:owaspExpansion:()');
    assert.equal(owaspLabel.clientHeight, owaspDetail.clientHeight);
    assert.dom('[data-test-owasp="1"]').exists();
    assert.dom('[data-test-owasp="2"]').exists();

    // CWE
    const cweLabel = this.element.querySelector(
      '[data-test-regulatory-label="cwe"]'
    );
    const cweDetail = this.element.querySelector(
      '[data-test-regulatory-detail="cwe"]'
    );
    assert.equal(cweLabel.innerHTML, 'CWE');
    assert.equal(cweLabel.title, 't:cweExpansion:()');
    assert.equal(cweLabel.clientHeight, cweDetail.clientHeight);
    assert.dom('[data-test-cwe="1"]').exists();
    assert.dom('[data-test-cwe="2"]').exists();

    // ASVS
    const asvsLabel = this.element.querySelector(
      '[data-test-regulatory-label="asvs"]'
    );
    const asvsDetail = this.element.querySelector(
      '[data-test-regulatory-detail="asvs"]'
    );
    assert.equal(asvsLabel.innerHTML, 'ASVS');
    assert.equal(asvsLabel.title, 't:asvsExpansion:()');
    assert.equal(asvsLabel.clientHeight, asvsDetail.clientHeight);
    assert.dom('[data-test-asvs="1"]').exists();
    assert.dom('[data-test-asvs="2"]').exists();

    // MSTG
    const mstgLabel = this.element.querySelector(
      '[data-test-regulatory-label="mstg"]'
    );
    const mstgDetail = this.element.querySelector(
      '[data-test-regulatory-detail="mstg"]'
    );
    assert.equal(mstgLabel.innerHTML, 'MSTG');
    assert.equal(mstgLabel.title, 't:mstgExpansion:()');
    assert.equal(mstgLabel.clientHeight, mstgDetail.clientHeight);
    assert.dom('[data-test-mstg="1"]').exists();
    assert.dom('[data-test-mstg="2"]').exists();

    // PCIDSS
    const pcidssLabel = this.element.querySelector(
      '[data-test-regulatory-label="pcidss"]'
    );
    const pcidssDetail = this.element.querySelector(
      '[data-test-regulatory-detail="pcidss"]'
    );
    assert.equal(pcidssLabel.innerHTML, 'PCI-DSS');
    assert.equal(pcidssLabel.title, 't:pcidssExpansion:()');
    assert.equal(pcidssLabel.clientHeight, pcidssDetail.clientHeight);
    assert.dom('[data-test-pcidss="1"]').exists();
    assert.dom('[data-test-pcidss="2"]').exists();

    // HIPAA
    const hipaaLabel = this.element.querySelector(
      '[data-test-regulatory-label="hipaa"]'
    );
    const hipaaDetail = this.element.querySelector(
      '[data-test-regulatory-detail="hipaa"]'
    );
    assert.equal(hipaaLabel.innerHTML, 'HIPAA');
    assert.equal(hipaaLabel.title, 't:hipaaExpansion:()');
    assert.equal(hipaaLabel.clientHeight, hipaaDetail.clientHeight);
    assert.dom('[data-test-hipaa="1"]').exists();
    assert.dom('[data-test-hipaa="2"]').exists();

    // GDPR
    const gdprLabel = this.element.querySelector(
      '[data-test-regulatory-label="gdpr"]'
    );
    const gdprDetail = this.element.querySelector(
      '[data-test-regulatory-detail="gdpr"]'
    );
    assert.equal(gdprLabel.innerHTML, 'GDPR');
    assert.equal(gdprLabel.title, 't:gdprExpansion:()');
    assert.equal(gdprLabel.clientHeight, gdprDetail.clientHeight);
    assert.dom('[data-test-gdpr="1"]').exists();
    assert.dom('[data-test-gdpr="2"]').exists();
  });

  test('it should maintain equal column height on view more toggle of description', async function (assert) {
    const profile = this.server.create('profile', {
      reportPreference: {
        show_pcidss: {
          value: false,
          is_inherited: true,
        },
        show_hipaa: {
          value: true,
          is_inherited: true,
        },
        show_gdpr: {
          value: false,
          is_inherited: false,
        },
      },
    });

    const file = this.server.create('file', {
      profile: profile,
      project: this.project,
    });

    const analysis = this.server.create('analysis', {
      file: file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.CRITICAL,
      status: ENUMS.ANALYSIS.COMPLETED,
    });
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);

    const hipaaLabel = this.element.querySelector(
      '[data-test-regulatory-label="hipaa"]'
    );
    const hipaaDetail = this.element.querySelector(
      '[data-test-regulatory-detail="hipaa"]'
    );
    assert.equal(hipaaLabel.clientHeight, hipaaDetail.clientHeight);

    let initialHeight = hipaaLabel.clientHeight;

    const hipaa1 = this.element.querySelector('[data-test-hipaa="1"]');
    const hipaa1ToggleMore = hipaa1.querySelector(
      '[data-test-hipaa-toggle="more"]'
    );
    const hipaa2 = this.element.querySelector('[data-test-hipaa="2"]');
    const hipaa2ToggleMore = hipaa2.querySelector(
      '[data-test-hipaa-toggle="more"]'
    );

    // expand first desc
    await click(hipaa1ToggleMore);
    assert.equal(hipaaLabel.clientHeight, hipaaDetail.clientHeight);
    assert.ok(initialHeight < hipaaLabel.clientHeight);

    const hipaa1ToggleLess = hipaa1.querySelector(
      '[data-test-hipaa-toggle="less"]'
    );

    // expand second desc
    await click(hipaa2ToggleMore);
    assert.equal(hipaaLabel.clientHeight, hipaaDetail.clientHeight);

    const hipaa2ToggleLess = hipaa2.querySelector(
      '[data-test-hipaa-toggle="less"]'
    );

    // collapse first desc
    await click(hipaa1ToggleLess);
    assert.equal(hipaaLabel.clientHeight, hipaaDetail.clientHeight);

    // collapse first desc
    await click(hipaa2ToggleLess);
    assert.equal(hipaaLabel.clientHeight, hipaaDetail.clientHeight);

    assert.equal(initialHeight, hipaaLabel.clientHeight);
  });

  test('it should not render regulatory if empty data', async function (assert) {
    const profile = this.server.create('profile', {
      reportPreference: {
        show_pcidss: {
          value: true,
          is_inherited: true,
        },
        show_hipaa: {
          value: true,
          is_inherited: true,
        },
        show_gdpr: {
          value: true,
          is_inherited: false,
        },
      },
    });
    const file = this.server.create('file', {
      profile: profile,
      project: this.project,
    });

    const analysis = this.server.create('analysis', {
      file: file,
      vulnerability: this.vulnerability,
      computedRisk: ENUMS.RISK.CRITICAL,
      status: ENUMS.ANALYSIS.COMPLETED,
    });

    analysis.cvssBase = 0;
    analysis.cvssVector = '';
    analysis.cvssMetricsHumanized = [];
    analysis.owasp = [];
    analysis.cwe = [];
    analysis.asvs = [];
    analysis.mstg = [];
    analysis.pcidss = [];
    analysis.hipaa = [];
    analysis.gdpr = [];
    this.set('analysis', analysis);

    await render(hbs`<AnalysisDetails @analysis={{this.analysis}} />`);

    const header = this.element.querySelector(
      '[data-test-analysis-detail="header"]'
    );
    await click(header);

    assert.dom('[data-test-regulatory="cvssv3"]').doesNotExist();
    assert.dom('[data-test-regulatory="owasp"]').doesNotExist();
    assert.dom('[data-test-regulatory="cwe"]').doesNotExist();
    assert.dom('[data-test-regulatory="asvs"]').doesNotExist();
    assert.dom('[data-test-regulatory="mstg"]').doesNotExist();
    assert.dom('[data-test-regulatory="pcidss"]').doesNotExist();
    assert.dom('[data-test-regulatory="hipaa"]').doesNotExist();
    assert.dom('[data-test-regulatory="gdpr"]').doesNotExist();
  });

  //   test('tapping button fires an external action', async function (assert) {
  //     this.set('analysis', {
  //       file: { id: 1 },
  //       vulnerability: { id: 1 },
  //       computedRisk: ENUMS.RISK.NONE,
  //       status: ENUMS.ANALYSIS.COMPLETED
  //     });
  //     this.set("risks", ENUMS.RISK.CHOICES.slice(0, -1));
  //     await render(hbs`<AnalysisDetails @analysis={{this.analysis}}`)
  //     assert.deepEqual(this.get("filteredRisks"),
  //       [
  //         { "key": "NONE", "value": 0 },
  //         { "key": "LOW", "value": 1 },
  //         { "key": "MEDIUM", "value": 2 },
  //         { "key": "HIGH", "value": 3 },
  //         { "key": "CRITICAL", "value": 4 }
  //       ], 'Filtered Risks');
  //     assert.equal(this.get("markedRisk"), 0, 'Marked Risk');
  //     this.send('toggleVulnerability');
  //     assert.equal(this.get('showVulnerability'), true, "Show Vulnerability");

  //     this.send('openEditAnalysisModal');
  //     // this.send('selectMarkedAnalyis');
  //     // this.send('selectMarkedAnalyisType');
  //     this.send('removeMarkedAnalysis');
  //     this.set('analysis', { file: { id: 1 }, vulnerability: { id: 1 } });
  //     this.send('markAnalysis');
  //     this.send('editMarkedAnalysis');
  //     this.send('cancelEditMarkingAnalysis');
  //     this.send('resetMarkedAnalysis');
  //     this.send('openResetMarkedAnalysisConfirmBox');
  //     assert.notOk(this.confirmCallback());

  //     this.set("analysis", { vulnerability: { types: [] } });
  //     assert.deepEqual(this.get("tags"), [], 'Empty Types');

  //     this.set("analysis", { vulnerability: { types: [1] }, file: { isStaticDone: true } });
  //     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "static" }, 'Risk Type');
  //     this.set("analysis", { vulnerability: { types: [2] }, file: { isDynamicDone: true } });
  //     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "dynamic" }, 'Risk Type');
  //     this.set("analysis", { vulnerability: { types: [3] }, file: { isManualDone: true } });
  //     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "manual" }, 'Risk Type');
  //     this.set("analysis", { vulnerability: { types: [4] }, file: { isApiDone: true } });
  //     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "api" }, 'Risk Type');
  //   });

  //   test('statusClass is computed correctly', async function (assert) {
  //     this.set('analysis', { file: { id: 1 }, vulnerability: { id: 1 } });
  //     await render(hbs`<AnalysisDetails @analysis={{this.analysis}}`)

  //     this.set('analysis', { status: ENUMS.ANALYSIS.COMPLETED, computedRisk: ENUMS.RISK.NONE });
  //     assert.equal(this.get('statusClass'), 'is-completed');

  //     this.set('analysis', { status: ENUMS.ANALYSIS.WAITING });
  //     assert.equal(this.get('statusClass'), 'is-waiting');

  //     this.set('analysis', { status: ENUMS.ANALYSIS.RUNNING });
  //     assert.equal(this.get('statusClass'), 'is-progress');

  //     this.set('analysis', { status: ENUMS.ANALYSIS.ERROR });
  //     assert.equal(this.get('statusClass'), 'is-errored');

  //     this.set('analysis', { status: ENUMS.ANALYSIS.COMPLETED, computedRisk: ENUMS.RISK.UNKNOWN });
  //     assert.equal(this.get('statusClass'), 'is-untested');

  //     this.set('analysis', { status: ENUMS.ANALYSIS.RUNNING, computedRisk: ENUMS.RISK.UNKNOWN });
  //     assert.equal(this.get('statusClass'), 'is-progress');
  //   });
});
