import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

const getRiskStatusObj = (
  risk,
  status = ENUMS.ANALYSIS.COMPLETED,
  isOverridden = false
) => analysisRiskStatus([risk, status, isOverridden]);

module('Integration | Component | analysis-risk/tag', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test.each(
    'it renders risk tag for different computedRisk correctly',
    [
      ENUMS.RISK.UNKNOWN,
      ENUMS.RISK.NONE,
      ENUMS.RISK.LOW,
      ENUMS.RISK.MEDIUM,
      ENUMS.RISK.HIGH,
      ENUMS.RISK.CRITICAL,
    ],
    async function (assert, computedRisk) {
      this.setProperties({ computedRisk });

      await render(
        hbs`<AnalysisRisk::Tag @computedRisk={{this.computedRisk}} />`
      );

      const { label, cssclass } = getRiskStatusObj(this.computedRisk);

      assert
        .dom(`[data-test-analysisRiskTag-root="${label}"]`)
        .exists()
        .hasClass(RegExp(cssclass));

      assert.dom('[data-test-analysisRiskTag-label]').hasText(label);
      assert.dom('[data-test-analysisRiskTag-editIcon]').doesNotExist();
    }
  );

  test.each(
    'it renders risk tag for different status correctly',
    [
      ENUMS.ANALYSIS.ERROR,
      ENUMS.ANALYSIS.WAITING,
      ENUMS.ANALYSIS.RUNNING,
      ENUMS.ANALYSIS.COMPLETED,
    ],
    async function (assert, status) {
      this.setProperties({ computedRisk: ENUMS.RISK.UNKNOWN, status });

      await render(
        hbs`<AnalysisRisk::Tag @computedRisk={{this.computedRisk}} @status={{this.status}} />`
      );

      const { label, cssclass } = getRiskStatusObj(
        this.computedRisk,
        this.status
      );

      assert
        .dom(`[data-test-analysisRiskTag-root="${label}"]`)
        .exists()
        .hasClass(RegExp(cssclass));

      assert.dom('[data-test-analysisRiskTag-label]').hasText(label);
      assert.dom('[data-test-analysisRiskTag-editIcon]').doesNotExist();
    }
  );

  test.each(
    'it renders edit icon if risk is overidden & is not none and tooltip enable/disable',
    [false, true],
    async function (assert, disableOverriddenTooltip) {
      this.setProperties({
        computedRisk: ENUMS.RISK.HIGH,
        originalRisk: ENUMS.RISK.HIGH,
        overriddenRisk: ENUMS.RISK.LOW,
        disableOverriddenTooltip,
      });

      await render(
        hbs`
          <AnalysisRisk::Tag 
            @computedRisk={{this.computedRisk}}
            @isOverridden={{true}}
            @overriddenRisk={{this.overriddenRisk}}
            @originalRisk={{this.originalRisk}}
            @disableOverriddenTooltip={{this.disableOverriddenTooltip}}
          />
        `
      );

      const { label } = getRiskStatusObj(this.computedRisk);

      assert.dom(`[data-test-analysisRiskTag-root="${label}"]`).exists();

      assert.dom('[data-test-analysisRiskTag-label]').hasText(label);
      assert.dom('[data-test-analysisRiskTag-editIcon]').exists();

      assert.dom('[data-test-analysisRiskTag-tooltipContent]').doesNotExist();

      await triggerEvent('[data-test-analysisRiskTag-editIcon]', 'mouseenter');

      if (disableOverriddenTooltip) {
        assert.dom('[data-test-analysisRiskTag-tooltipContent]').doesNotExist();

        assert
          .dom('[data-test-analysisRiskTag-tooltipOriginalRiskText]')
          .doesNotExist();

        assert
          .dom('[data-test-analysisRiskTag-tooltipOverriddenRiskText]')
          .doesNotExist();
      } else {
        const orginalRiskText = riskText([this.originalRisk]);
        const overriddenRiskText = riskText([this.overriddenRisk]);

        assert.dom('[data-test-analysisRiskTag-tooltipContent]').exists();

        assert
          .dom('[data-test-analysisRiskTag-tooltipOriginalRiskText]')
          .hasText(`t:${orginalRiskText}:()`);

        assert
          .dom('[data-test-analysisRiskTag-tooltipOverriddenRiskText]')
          .hasText(`t:${overriddenRiskText}:()`);
      }
    }
  );
});
