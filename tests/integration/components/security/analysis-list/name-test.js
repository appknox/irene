import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  name: '[data-test-securityAnalysisListTable-analysisName]',
  fpIcon: '[data-test-securityAnalysisListTable-falsePositiveIcon]',
  fpTooltip: '[data-test-securityAnalysisListTable-falsePositiveTooltip]',
  tooltipContent: '[data-test-ak-tooltip-content]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisList::Table::Name
  @analysis={{this.analysis}}
/>`;

module(
  'Integration | Component | security/analysis-list/table/name',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.pushAnalysis = (attrs = {}) => {
        const vulnerability = this.server.create('vulnerability');

        const vulnerabilityModel = this.store.push(
          this.store.normalize('vulnerability', {
            attributes: vulnerability.toJSON(),
            id: vulnerability.id,
            type: 'vulnerabilities',
          })
        );

        const record = this.server.create('security/analysis', {
          vulnerability: vulnerabilityModel.id,
          ...attrs,
        });

        this.vulnerabilityName = vulnerabilityModel.name;

        return this.store.push(
          this.store.normalize('security/analysis', record.toJSON())
        );
      };

      this.analysis = this.pushAnalysis();
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it links to the analysis by its vulnerability name', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.name)
        .hasText(this.vulnerabilityName)
        .hasAttribute('href', `/security/analysis/${this.analysis.id}`);
    });

    test('an analysis with no id renders nothing', async function (assert) {
      this.analysis = this.store.createRecord('security/analysis');

      await render(TEMPLATE);

      assert.dom(selectors.name).doesNotExist();
    });

    // ─── All false positives ───────────────────────────────────────────────

    test('an all false positive analysis is flagged beside its name', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });

      await render(TEMPLATE);

      assert.dom(selectors.fpIcon).hasAttribute('icon', /warning/);
      assert.dom(selectors.name).hasText(this.vulnerabilityName);
    });

    test('the flag explains itself on hover', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: true });

      await render(TEMPLATE);
      await triggerEvent(selectors.fpTooltip, 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .hasText(t('securityAnalysisList.allFalsePositives'));
    });

    test('an analysis with a true positive carries no flag', async function (assert) {
      this.analysis = this.pushAnalysis({ is_knoxiq_all_fp: false });

      await render(TEMPLATE);

      assert.dom(selectors.fpIcon).doesNotExist();
    });
  }
);
