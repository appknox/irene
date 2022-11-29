import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import faker from 'faker';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { module, test } from 'qunit';

module('Integration | Component | risk-tag', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
    this.vulnerability = this.store.createRecord('vulnerability', {
      id: 1,
      name: faker.lorem.words(2),
      types: [1],
    });
  });

  test('it renders correctly', async function (assert) {
    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      status: ENUMS.ANALYSIS.COMPLETED,
      createdOn: faker.date.past(),
      updatedOn: faker.date.past(),
      risk: ENUMS.RISK.NONE,
      computedRisk: 1,
      vulnerability: this.vulnerability,
    });

    await render(
      hbs`<RiskTag @analysis={{this.analysis}} @columnSize='is-one-sixth' />`
    );

    const riskTagLabel = analysisRiskStatus([
      this.analysis.computedRisk,
      this.analysis.status,
      this.analysis.isOverriddenRisk,
    ]).label;

    assert.dom('[data-test-analysis-risk-tag]').exists();
    assert
      .dom(`[data-test-analysis-risk-tag-label="${riskTagLabel}"]`)
      .exists();

    assert.dom('[data-test-risk-tag-icon]').exists();
    assert
      .dom('[data-test-risk-tag-label]')
      .exists()
      .containsText(riskTagLabel);

    assert.dom('[data-test-risk-tag-edit-icon]').doesNotExist();
  });

  test('it renders edit icon if risk is overidden and is not none', async function (assert) {
    this.analysis = this.store.createRecord('analysis', {
      id: 1,
      status: ENUMS.ANALYSIS.COMPLETED,
      overriddenRisk: 'High',
      risk: ENUMS.RISK.HIGH,
      computedRisk: 1,
      vulnerability: this.vulnerability,
    });

    await render(
      hbs`<RiskTag @analysis={{this.analysis}} @columnSize='is-one-sixth' />`
    );

    assert.dom('[data-test-risk-tag-edit-icon]').exists();
  });
});
