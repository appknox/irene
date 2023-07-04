import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { module, test } from 'qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | risk-tag', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');

    const vulnerability = this.server.create('vulnerability');

    this.vulnerability = this.store.push(
      this.store.normalize('vulnerability', {
        attributes: vulnerability.toJSON(),
        id: vulnerability.id,
        relationships: {},
        type: 'vulnerabilities',
      })
    );

    const analysis = this.server.create('analysis', {
      vulnerability: vulnerability.id,
      file: '1',
      status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    });

    this.analysis = this.store.push(
      this.store.normalize('analysis', analysis.toJSON())
    );
  });

  test('it renders correctly', async function (assert) {
    this.analysis.overriddenRisk = null;

    await render(
      hbs`<RiskTag @analysis={{this.analysis}} @columnSize='is-one-sixth' />`
    );

    const { label } = analysisRiskStatus([
      this.analysis.computedRisk,
      this.analysis.status,
      this.analysis.isOverriddenRisk,
    ]);

    assert.dom(`[data-test-analysisRiskTag-root="${label}"]`).exists();
    assert.dom('[data-test-analysisRiskTag-label]').hasText(label);
    assert.dom('[data-test-analysisRiskTag-editIcon]').doesNotExist();
  });

  test('it renders with label & labelClass arguments', async function (assert) {
    this.setProperties({
      label: 'Critical',
      labelClass: 'is-critical',
    });

    await render(
      hbs`<RiskTag @analysis={{this.analysis}} @label={{this.label}} @labelClass={{this.labelClass}} />`
    );

    assert
      .dom(`[data-test-analysisRiskTag-root="${this.label}"]`)
      .exists()
      .hasClass(/is-critical/);

    assert.dom('[data-test-analysisRiskTag-label]').hasText(this.label);
    assert.dom('[data-test-analysisRiskTag-editIcon]').doesNotExist();
  });

  test('it renders edit icon if risk is overidden and is not none', async function (assert) {
    this.analysis.overriddenRisk = ENUMS.RISK.LOW;
    this.analysis.risk = ENUMS.RISK.HIGH;
    this.analysis.computedRisk = ENUMS.RISK.HIGH;

    await render(
      hbs`<RiskTag @analysis={{this.analysis}} @columnSize='is-one-sixth' />`
    );

    const { label } = analysisRiskStatus([
      this.analysis.computedRisk,
      this.analysis.status,
      this.analysis.isOverriddenRisk,
    ]);

    assert.dom(`[data-test-analysisRiskTag-root="${label}"]`).exists();
    assert.dom('[data-test-analysisRiskTag-label]').hasText(label);
    assert.dom('[data-test-analysisRiskTag-editIcon]').exists();
  });
});
