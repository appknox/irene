import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { KNOXIQ_VULNERABILITY_ANALYSIS_DEFAULT_SORTS } from 'irene/components/knox-iq/vulnerability-analysis';
import { pushAnalysisOverviewForKnoxiq } from 'irene/tests/helpers/knoxiq-test-utils';

const EXPLOITABILITY_LEVEL_BY_LIKELIHOOD = {
  [ENUMS.KNOXIQ_EXPLOITABILITY.HIGH]: 'high',
  [ENUMS.KNOXIQ_EXPLOITABILITY.MEDIUM]: 'medium',
  [ENUMS.KNOXIQ_EXPLOITABILITY.LOW]: 'low',
  [ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN]: 'untested',
};

module('Integration | Component | knox-iq', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  test.each(
    'it renders exploitability level icons',
    [
      ENUMS.KNOXIQ_EXPLOITABILITY.HIGH,
      ENUMS.KNOXIQ_EXPLOITABILITY.MEDIUM,
      ENUMS.KNOXIQ_EXPLOITABILITY.LOW,
      ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN,
    ],
    async function (assert, likelihood) {
      this.level = EXPLOITABILITY_LEVEL_BY_LIKELIHOOD[likelihood] ?? 'untested';

      await render(hbs`
        <KnoxIq::ExploitabilityLevelIcon @level={{this.level}} />
      `);

      assert.dom('[data-test-knoxiq-exploitabilityLevelIcon]').exists();
      assert.dom('[data-test-ak-icon]').exists({ count: 3 });
    }
  );

  test('it renders KnoxIQ status chip and status card states', async function (assert) {
    await render(hbs`
      <KnoxIq::StatusChip @state='completed' />
      <KnoxIq::StatusCard @title='KnoxIQ Ready' @subtitle='Run a scan' @state='active' />
    `);

    assert.dom().containsText(t('completed'));
    assert.dom('[data-test-knoxiq-status-card]').exists();
    assert.dom('[data-test-knoxiq-status-card-runBtn]').exists();
  });

  module('vulnerability analysis', function (nestedHooks) {
    nestedHooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', { project: '1' });

      this.server.create('project', { last_file: file, id: '1' });
      this.file = store.push(store.normalize('file', file.toJSON()));

      const vulnerability = this.server.create('vulnerability');
      const overview = this.server.create('analysis-overview', {
        file: file.id,
        vulnerability: vulnerability.id,
        exploitability_likelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH,
        status: ENUMS.ANALYSIS_STATUS.COMPLETED,
      });

      this.fileAnalyses = [
        store.push(
          store.normalize('analysis-overview', {
            ...overview.toJSON(),
            relationships: {
              vulnerability: {
                data: { type: 'vulnerabilities', id: vulnerability.id },
              },
            },
          })
        ),
      ];

      this.sorts = KNOXIQ_VULNERABILITY_ANALYSIS_DEFAULT_SORTS;
      this.updateAnalysesSorts = (sorts) => {
        this.sorts = sorts;
      };
    });

    test('it renders vulnerability analysis table rows', async function (assert) {
      await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

      assert.dom('[data-test-knoxiq-vulnerability-analysis-table]').exists();
      assert
        .dom('[data-test-knoxiq-vulnerability-analysis-row]')
        .exists({ count: 1 });
      assert.dom('[data-test-knoxiq-exploitabilityLevelIcon]').exists();
    });

    test.each(
      'it renders exploitability cell tooltip only for untested likelihood',
      [
        [ENUMS.KNOXIQ_EXPLOITABILITY.HIGH, false],
        [ENUMS.KNOXIQ_EXPLOITABILITY.MEDIUM, false],
        [ENUMS.KNOXIQ_EXPLOITABILITY.LOW, false],
        [ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN, true],
      ],
      async function (assert, [exploitabilityLikelihood, showsTooltip]) {
        this.analysis = pushAnalysisOverviewForKnoxiq(
          this.server,
          this.owner.lookup('service:store'),
          { exploitability_likelihood: exploitabilityLikelihood }
        );

        await render(hbs`
          <KnoxIq::VulnerabilityAnalysis::Table::Exploitability
            @analysis={{this.analysis}}
          />
        `);

        assert
          .dom('[data-test-knoxiq-vulnerability-analysis-exploitability-cell]')
          .exists();
        assert.dom('[data-test-knoxiq-exploitabilityLevelIcon]').exists();

        if (showsTooltip) {
          assert
            .dom(
              '[data-test-knoxiq-vulnerability-analysis-exploitability-tooltip]'
            )
            .exists();
        } else {
          assert
            .dom(
              '[data-test-knoxiq-vulnerability-analysis-exploitability-tooltip]'
            )
            .doesNotExist();
        }
      }
    );
  });
});
