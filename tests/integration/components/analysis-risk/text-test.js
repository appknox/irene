import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';

module('Integration | Component | analysis-risk/text', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  test.each(
    'it renders risk text for different risk correctly',
    [
      ENUMS.RISK.UNKNOWN,
      ENUMS.RISK.NONE,
      ENUMS.RISK.LOW,
      ENUMS.RISK.MEDIUM,
      ENUMS.RISK.HIGH,
      ENUMS.RISK.CRITICAL,
    ],
    async function (assert, risk) {
      this.setProperties({ risk });

      await render(
        hbs`<AnalysisRisk::Text data-test-analysisRiskText-text @risk={{this.risk}} />`
      );

      const text = riskText([this.risk]);

      assert
        .dom('[data-test-analysisRiskText-text]')
        .exists()
        .hasText(t(text))
        .hasClass(RegExp(`analysis-risk-text-${text}`));
    }
  );
});
