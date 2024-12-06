import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';

// default status = completed
// default overridden_risk = null
const RISK_VALUES = [
  { risk: ENUMS.RISK.NONE },
  { risk: ENUMS.RISK.CRITICAL },
  { risk: ENUMS.RISK.HIGH },
  { risk: ENUMS.RISK.MEDIUM },
  { risk: ENUMS.RISK.LOW },
  { risk: ENUMS.RISK.CRITICAL, overridden_risk: ENUMS.RISK.LOW }, // overridden
  // overridden not completed
  {
    risk: ENUMS.RISK.UNKNOWN,
    overridden_risk: ENUMS.RISK.LOW,
    status: ENUMS.ANALYSIS.WAITING,
  },
  { risk: ENUMS.RISK.NONE, overridden_risk: ENUMS.RISK.CRITICAL }, // system passed
  { risk: ENUMS.RISK.NONE, overridden_risk: ENUMS.RISK.NONE }, // system passed
  { risk: ENUMS.RISK.CRITICAL, overridden_risk: ENUMS.RISK.NONE }, // overridden passed
  { risk: ENUMS.RISK.LOW, overridden_risk: ENUMS.RISK.NONE }, // overridden passed
  // overridden passed not completed
  {
    risk: ENUMS.RISK.UNKNOWN,
    overridden_risk: ENUMS.RISK.NONE,
    status: ENUMS.ANALYSIS.WAITING,
  },
];

module('Integration | Component | file-chart', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Server mocks
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    // Store service
    this.store = this.owner.lookup('service:store');

    const vulnerabilities = this.server.createList(
      'vulnerability',
      RISK_VALUES.length
    );

    const analyses = vulnerabilities.map((v, idx) => {
      const { risk, overridden_risk, status } = RISK_VALUES[idx];

      return this.server
        .create('analysis', {
          vulnerability: v.id,
          status: status ?? ENUMS.ANALYSIS.COMPLETED,
          risk,
          overridden_risk: overridden_risk ?? null,
        })
        .toJSON();
    });

    const file = this.server.create('file', {
      analyses,
    });

    const normalizedFile = this.store.normalize('file', {
      ...file.toJSON(),
      analyses,
    });

    const fileModel = this.store.push(normalizedFile);

    this.setProperties({
      file: fileModel,
      analyses,
    });
  });

  test('it displays marked as passed icon if file analyses contains atleast one passed overriden risk', async function (assert) {
    await render(hbs`
      <FileChart       
        {{style maxWidth='350px'}}
        @file={{this.file}}
        @legendMaxWidth={{350}} 
      />
    `);

    assert
      .dom('[data-test-fileChartSeverityLevel-ignoreVulnerabilityIcon]')
      .exists();

    // Tootlip selector input type column
    await triggerEvent(
      '[data-test-fileChartSeverityLevel-ignoreVulnerabilityIcon]',
      'mouseenter'
    );

    const passedRiskCount = this.file.analyses.reduce(
      (count, a) =>
        a.isOverriddenAsPassed && a.status === ENUMS.ANALYSIS.COMPLETED
          ? count + 1
          : count,
      0
    );

    assert
      .dom(
        '[data-test-fileChartSeverityLevel-ignoreVulnerabilityIcon-tooltipContent]'
      )
      .exists()
      .containsText(
        t('ignoreVulnerabilityFileChartMessage', {
          overridenPassedRiskCount: passedRiskCount,
        })
      );
  });
});
