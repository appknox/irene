import { find, render, triggerEvent } from '@ember/test-helpers';
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
  presence:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityPresence]',
  witnessPath:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessLabel]',
  witnessEdge:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessEdge]',
  witnessStep: (index) =>
    `[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessStep="${index}"]`,
  witnessArrow:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityWitnessArrow]',
  blocker: (code) =>
    `[data-test-sbomComponentVulnerabilities-detailReachabilityBlocker="${code}"]`,
  blockers:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityBlockers]',
  howItWorks:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityHowItWorks]',
  pathExplanationLabel:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityPathExplanationLabel]',
  pathExplanation:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityPathExplanation]',
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
        .hasText(t('sbomModule.reachability.vulnerableFunction'));
      assert
        .dom(selectors.targetValue)
        .hasText('com.example.Parser.parse(java.lang.String)');
      assert
        .dom(selectors.presence)
        .hasText(t('sbomModule.reachability.presentInVersion'));
      assert.dom(selectors.witnessPath).exists();
      assert
        .dom(selectors.witnessStep(0))
        .includesText('MainActivity.onCreate');
      assert
        .dom(selectors.witnessStep(0))
        .includesText(t('sbomModule.reachability.entryPoint'));
      assert
        .dom(`${selectors.witnessStep(0)} ${selectors.witnessArrow}`)
        .doesNotExist();
      assert.dom(selectors.witnessStep(1)).includesText('Parser.parse');
      assert
        .dom(selectors.witnessStep(1))
        .includesText(t('sbomModule.reachability.vulnerableFunction'));
      assert
        .dom(`${selectors.witnessStep(1)} ${selectors.witnessArrow}`)
        .exists();
      assert.dom(selectors.blockers).doesNotExist();
    });

    // ─── Target explanation ──────────────────────────────────────────────────
    test('it renders the witness explanation under the call path', async function (assert) {
      const store = this.owner.lookup('service:store');
      const explanation =
        'App behavior: The confirmed prefix starts in onCreate. ' +
        'Analyst assessment: The receiver type was inferred but not proven.';

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.POTENTIALLY_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            witness_path: [
              { caller: 'MainActivity.onCreate', callee: 'Parser.parse' },
            ],
            targets: [
              {
                label: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
                explanation,
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.pathExplanationLabel)
        .hasText(t('sbomModule.reachability.pathExplanation'));
      assert.dom(selectors.pathExplanation).includesText(explanation);
    });

    test('it hides the witness explanation when the target has none', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.POTENTIALLY_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            witness_path: [
              { caller: 'MainActivity.onCreate', callee: 'Parser.parse' },
            ],
            targets: [
              {
                label: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
                explanation: null,
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.pathExplanation).doesNotExist();
      assert.dom(selectors.pathExplanationLabel).doesNotExist();
    });

    // ─── Non-direct witness edge ─────────────────────────────────────────────
    test('it marks framework and dynamic edges in the call path', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.POTENTIALLY_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            witness_path: [
              {
                caller: 'MainActivity.onCreate',
                callee: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
                edge_type: 'XML_CALLBACK',
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.witnessEdge).exists().hasText('xml callback');
      assert
        .dom(selectors.witnessStep(1))
        .includesText('com.example.Parser.parse(java.lang.String)');
    });

    // ─── Unknown ──────────────────────────────────────────────────────────────
    test('it shows the section with blocker reason for unknown target-data-missing', async function (assert) {
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

      assert.dom(selectors.root).exists();
      assert.dom(selectors.blocker('TARGET_DATA_MISSING')).exists();
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
        .hasText('com.example.Parser.parse(java.lang.String)');
    });

    // ─── Uncategorised blocker ────────────────────────────────────────────────
    test('it falls back to a generic blocker category for unknown codes', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.UNKNOWN,
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
        .hasText(t('sbomModule.reachability.blockerCategories.other'));
    });

    test('it renders one chip when blockers share a category', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.UNKNOWN,
            target_presence: 'PRESENT',
            target:
              'Source/FramePublish.swift::FramePublish::initializer::init',
            blockers: [
              'IOS_DIRECT_CALL_PATH_NOT_FOUND',
              'IOS_INDIRECT_DISPATCH_UNMODELED',
            ],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.blocker('IOS_DIRECT_CALL_PATH_NOT_FOUND'))
        .exists({ count: 1 })
        .hasText(
          t('sbomModule.reachability.blockerCategories.iosIndirectCalls')
        );
      assert
        .dom(selectors.blocker('IOS_INDIRECT_DISPATCH_UNMODELED'))
        .doesNotExist();
    });

    // ─── Conclusive verdict ───────────────────────────────────────────────────
    test('it hides inconclusive reasons for conclusive verdicts', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: ['TARGET_NOT_OBSERVED'],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.blockers).doesNotExist();
      assert.dom(selectors.blocker('TARGET_NOT_OBSERVED')).doesNotExist();
    });

    // ─── Server summary ─────────────────────────────────────────────────────
    test('it leads with the server summary as the explanation', async function (assert) {
      const store = this.owner.lookup('service:store');
      const summary =
        'We found no call path, but a call may cross into native (C/C++) code that we cannot trace.';

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.UNKNOWN,
            summary,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Native;->decode()V',
            blockers: ['JNI_BOUNDARY'],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detailReachabilityExplanation]'
        )
        .hasText(summary);
    });

    // ─── Help tooltip ────────────────────────────────────────────────────────
    test('it explains how reachability works in a tooltip', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            witness_path: [],
          },
        })
      );

      await render(TEMPLATE);

      await triggerEvent(find(selectors.howItWorks), 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText(t('sbomModule.reachability.howItWorks'));
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
