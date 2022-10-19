import Service from '@ember/service';
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

    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      vulnerability: this.vulnerability,
    });
  });

  test('it renders with the right properties', async function (assert) {
    this.vulnerability.name = 'One Time Password';

    this.analysis.vulnerability = this.vulnerability;
    this.analysis.risk = ENUMS.RISK.CRITICAL;
    this.analysis.status = ENUMS.ANALYSIS_STATUS.COMPLETED;

    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: true,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

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

  test('it renders when manual scan feature is enabled and vulnerability types include manual scan', async function (assert) {
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: true,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert.dom('[data-test-analysis-overview-container]').exists();
  });

  test('it renders when manual scan feature is enabled and vulnerability types do not include manual scan', async function (assert) {
    this.vulnerability.types = [
      ENUMS.VULNERABILITY_TYPE.STATIC,
      ENUMS.VULNERABILITY_TYPE.DYNAMIC,
    ];

    this.analysis.vulnerability = this.vulnerability;

    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: true,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert.dom('[data-test-analysis-overview-container]').exists();
  });

  test('it does not render when manual scan feature is disabled and vulnerability types include manual scan', async function (assert) {
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: false,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

    this.vulnerability.types = [ENUMS.VULNERABILITY_TYPE.MANUAL];
    this.analysis.vulnerability = this.vulnerability;

    await render(hbs`<AnalysisOverview  @analysis={{this.analysis }}/>`);
    assert.dom('[data-test-analysis-overview-container]').doesNotExist();
  });
});
