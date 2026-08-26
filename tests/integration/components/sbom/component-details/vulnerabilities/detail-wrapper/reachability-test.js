import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { ReachabilityVerdict } from 'irene/utils/sbom-reachability';

// ─── Selectors ───
const selectors = {
  root: '[data-test-sbomComponentVulnerabilities-detailReachability]',
  title: '[data-test-sbomComponentVulnerabilities-detailReachabilityTitle]',
  targetLabel:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityTargetLabel]',
  targetValue:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityTargetValue]',
  witnessPath:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessLabel]',
  witnessStep: (index) =>
    `[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessStep="${index}"]`,
  witnessArrow:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessArrow]',
  blocker: (code) =>
    `[data-test-sbomComponentVulnerabilities-detailReachabilityBlocker="${code}"]`,
  blockers:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityBlockers]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability
    @sbomVulnerabilityAudit={{this.sbomVulnerabilityAudit}}
  />
`;

// ─── Helpers ───
/**
 * Normalize a Mirage audit and push it into the store.
 */
function pushAudit(store, record) {
  return store.push(
    store.normalize('sbom-vulnerability-audit', record.toJSON())
  );
}

module(
  'Integration | Component | sbom/component-details/vulnerabilities/detail-wrapper/reachability',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    // ─── Path found ───────────────────────────────────────────────────────────
    test('it renders target and an indented witness path', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            witness_path: [
              { caller: 'MainActivity.onCreate', callee: 'Parser.parse' },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('sbomModule.reachability.title'));
      assert
        .dom(selectors.targetLabel)
        .hasText(t('sbomModule.reachability.target'));
      assert
        .dom(selectors.targetValue)
        .hasText('Lcom/example/Parser;->parse(Ljava/lang/String;)V');
      assert.dom(selectors.witnessPath).exists();
      assert.dom(selectors.witnessStep(0)).hasText('MainActivity.onCreate');
      assert
        .dom(`${selectors.witnessStep(0)} ${selectors.witnessArrow}`)
        .doesNotExist();
      assert.dom(selectors.witnessStep(1)).hasText('Parser.parse');
      assert
        .dom(`${selectors.witnessStep(1)} ${selectors.witnessArrow}`)
        .exists();
      assert.dom(selectors.blockers).doesNotExist();
    });

    // ─── Unknown ──────────────────────────────────────────────────────────────
    test('it hides the section for unknown with only target-data-missing', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.UNKNOWN,
            target_presence: '',
            target: null,
            blockers: ['TARGET_DATA_MISSING'],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    // ─── No path found ────────────────────────────────────────────────────────
    test('it hides witness path when no path was found', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.NO_PATH_FOUND,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.witnessPath).doesNotExist();
      assert.dom(selectors.blockers).doesNotExist();
      assert
        .dom(selectors.targetValue)
        .hasText('Lcom/example/Parser;->parse(Ljava/lang/String;)V');
    });

    // ─── Untranslated blocker ─────────────────────────────────────────────────
    test('it falls back to the raw blocker code when untranslated', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.UNSUPPORTED,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Native;->decode()V',
            blockers: ['SOME_ENGINE_CODE'],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.blocker('SOME_ENGINE_CODE'))
        .hasText('SOME_ENGINE_CODE');
    });

    // ─── Empty payload ────────────────────────────────────────────────────────
    test('it hides the section when the audit has no reachability payload', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: null,
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });
  }
);
