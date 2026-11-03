import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// ─── Selectors ───
const selectors = {
  root: '[data-test-sbomComponentVulnerabilities-reachabilityTargets]',
  calledLabel:
    '[data-test-sbomComponentVulnerabilities-reachabilityTargetsCalledLabel]',
  called: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityTargetsCalled="${index}"]`,
  alsoAffectedToggle:
    '[data-test-sbomComponentVulnerabilities-reachabilityTargetsAlsoAffectedToggle]',
  alsoAffected: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityTargetsAlsoAffected="${index}"]`,
};

const TEMPLATE = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability::Targets
    @finding={{this.finding}}
  />
`;

module(
  'Integration | Component | sbom/component-details/vulnerabilities/detail-wrapper/reachability/targets',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('it renders nothing without targets', async function (assert) {
      this.finding = { verdict: 'UNKNOWN', targets: [] };

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('it splits targets on has_witness and collapses the uncalled ones', async function (assert) {
      this.finding = {
        verdict: 'CONFIRMED_REACHABLE',
        targets: [
          { label: 'Lcom/example/Parser;->parse()', has_witness: true },
          { label: 'Lcom/example/Parser;->mapObject()', has_witness: false },
          { label: 'Lcom/example/Parser;->readTree()', has_witness: false },
        ],
      };

      await render(TEMPLATE);

      assert
        .dom(selectors.calledLabel)
        .hasText(t('sbomModule.reachability.calledByYourApp'));

      assert.dom(selectors.called(0)).hasText('com.example.Parser.parse()');
      assert.dom(selectors.called(1)).doesNotExist();

      assert
        .dom(selectors.alsoAffectedToggle)
        .hasText(
          t('sbomModule.reachability.alsoAffectedNotCalled', { count: 2 })
        );

      // Collapsed by default.
      assert.dom(selectors.alsoAffected(0)).doesNotExist();

      await click(selectors.alsoAffectedToggle);

      assert
        .dom(selectors.alsoAffected(0))
        .hasText('com.example.Parser.mapObject()');
      assert
        .dom(selectors.alsoAffected(1))
        .hasText('com.example.Parser.readTree()');
    });

    test('it promotes the headline target when has_witness is absent', async function (assert) {
      this.finding = {
        verdict: 'CONFIRMED_REACHABLE',
        witness_path: [
          {
            caller: 'Lcom/example/MainActivity;->onCreate()',
            callee: 'Lcom/example/Parser;->parse()',
          },
        ],
        targets: [
          { label: 'Lcom/example/Parser;->parse()' },
          { label: 'Lcom/example/Parser;->mapObject()' },
        ],
      };

      await render(TEMPLATE);

      assert.dom(selectors.called(0)).hasText('com.example.Parser.parse()');
      assert.dom(selectors.alsoAffectedToggle).exists();
    });

    test('it calls nothing out when the payload has no path and no flags', async function (assert) {
      this.finding = {
        verdict: 'NO_PATH_FOUND',
        witness_path: [],
        targets: [{ label: 'Lcom/example/Parser;->parse()' }],
      };

      await render(TEMPLATE);

      assert.dom(selectors.calledLabel).doesNotExist();
      assert.dom(selectors.alsoAffectedToggle).exists();
    });
  }
);
