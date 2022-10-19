import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import ENUMS from 'irene/enums';
import { analysisStatus } from 'irene/helpers/analysis-status';
import { riskText } from 'irene/helpers/risk-text';
import { module, test } from 'qunit';

module('Integration | Component | analysis-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');

    this.vulnerability = this.store.createRecord('vulnerability', {
      id: 1,
      types: [ENUMS.VULNERABILITY_TYPE.MANUAL],
    });
  });

  test('it renders with the right properties when manual scan feature is enabled at the project level', async function (assert) {
    this.project = this.store.createRecord('project', {
      id: 1,
      isManualScanAvailable: true,
    });

    this.file = this.store.createRecord('file', {
      id: 1,
      project: this.project,
      name: 'Appknox-MFVA',
    });

    this.vulnerability.name = 'One Time Password';

    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      file: this.file,
      vulnerability: this.vulnerability,
      risk: ENUMS.RISK.CRITICAL,
      status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    });

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert
      .dom('[data-test-analysis-id]')
      .exists()
      .hasTextContaining(this.analysis.id);
    assert
      .dom('[data-test-analysis-vulnerability-name]')
      .exists()
      .hasTextContaining(this.vulnerability.name);

    assert
      .dom('[data-test-analysis-risk]')
      .exists()
      .hasTextContaining(`${riskText([this.analysis.risk])}`);
    assert
      .dom('[data-test-analysis-status]')
      .exists()
      .hasTextContaining(`${analysisStatus([this.analysis.status])}`);
  });

  test('it renders when manual scan feature is enabled at the project level and vulnerability types include manual scan', async function (assert) {
    this.project = this.store.createRecord('project', {
      id: 1,
      isManualScanAvailable: true,
    });

    this.file = this.store.createRecord('file', {
      id: 1,
      project: this.project,
      name: 'Appknox-MFVA',
    });

    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      vulnerability: this.vulnerability,
      file: this.file,
    });

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert.dom('[data-test-analysis-overview-container]').exists();
  });

  test('it renders when manual scan feature is enabled at the project level and vulnerability types do not include manual scan', async function (assert) {
    this.vulnerability.types = [
      ENUMS.VULNERABILITY_TYPE.STATIC,
      ENUMS.VULNERABILITY_TYPE.DYNAMIC,
    ];

    this.project = this.store.createRecord('project', {
      id: 1,
      isManualScanAvailable: true,
    });

    this.file = this.store.createRecord('file', {
      id: 1,
      project: this.project,
      name: 'Appknox-MFVA',
    });

    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      vulnerability: this.vulnerability,
      file: this.file,
    });

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert.dom('[data-test-analysis-overview-container]').exists();
  });

  test('it does not render when manual scan feature is disabled at the project level and vulnerability types include manual scan', async function (assert) {
    this.vulnerability.types = [ENUMS.VULNERABILITY_TYPE.MANUAL];

    this.project = this.store.createRecord('project', {
      id: 1,
      isManualScanAvailable: false,
    });

    this.file = this.store.createRecord('file', {
      id: 1,
      project: this.project,
      name: 'Appknox-MFVA',
    });

    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      vulnerability: this.vulnerability,
      file: this.file,
    });

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert.dom('[data-test-analysis-overview-container]').doesNotExist();
  });
});
