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
  callPath: '[data-test-sbomComponentVulnerabilities-reachabilityCallPath]',
  callPathEdge:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathEdge]',
  callPathStep: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathStep="${index}"]`,
  calledTarget: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityTargetsCalled="${index}"]`,
  blocker: (code) =>
    `[data-test-sbomComponentVulnerabilities-detailReachabilityBlocker="${code}"]`,
  blockers:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityBlockers]',
  howItWorks:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityHowItWorks]',
  narrative:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathNarrative]',
  reasoning:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityReasoning]',
  reasoningText:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityReasoningText]',
  reasoningVerdict:
    '[data-test-sbomComponentVulnerabilities-detailReachabilityReasoningVerdict]',
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
    test('it renders the called target and the call path', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: [],
            targets: [
              {
                label: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
                has_witness: true,
              },
            ],
            witness_path: [
              {
                caller: 'MainActivity.onCreate',
                callee: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('sbomModule.reachability.title'));
      assert.dom(selectors.callPath).exists();
      assert
        .dom(selectors.callPathStep(0))
        .includesText('MainActivity.onCreate');
      assert
        .dom(selectors.callPathStep(0))
        .includesText(t('sbomModule.reachability.entryPoint'));
      assert.dom(selectors.callPathStep(1)).includesText('Parser.parse()');
      assert
        .dom(selectors.callPathStep(1))
        .includesText(t('sbomModule.reachability.vulnerableFunction'));
      assert
        .dom(selectors.calledTarget(0))
        .hasText('com.example.Parser.parse(java.lang.String)');
      assert.dom(selectors.blockers).doesNotExist();
    });

    // ─── Target explanation ──────────────────────────────────────────────────
    test('it renders the witness explanation above the call path', async function (assert) {
      const store = this.owner.lookup('service:store');
      // The engine emits the two parts separated by a blank line; the panel
      // reads the behavior half inline and tucks the analyst half away.
      const explanation =
        'App behavior: The confirmed prefix starts in onCreate.\n\n' +
        'Analyst assessment: The receiver type was inferred but not proven.';
      const behavior = 'The confirmed prefix starts in onCreate.';

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

      assert.dom(selectors.narrative).includesText(behavior);
    });

    test('it renders the explanation of the witness-bearing target, not only the first', async function (assert) {
      const store = this.owner.lookup('service:store');
      // The engine emits the two parts separated by a blank line; the panel
      // reads the behavior half inline and tucks the analyst half away.
      const explanation =
        'App behavior: The confirmed prefix starts in onCreate.\n\n' +
        'Analyst assessment: The receiver type was inferred but not proven.';
      const behavior = 'The confirmed prefix starts in onCreate.';

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
                label: 'Lcom/example/Headline;->notWitness()V',
                explanation: null,
              },
              {
                label: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
                explanation,
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.narrative).includesText(behavior);
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

      assert.dom(selectors.narrative).doesNotExist();
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

      assert.dom(selectors.callPathEdge).exists().hasText('xml callback');
      assert.dom(selectors.callPathStep(1)).includesText('Parser.parse()');
    });

    // ─── Unknown ──────────────────────────────────────────────────────────────
    test('it shows the panel but not the chip for unknown target-data-missing', async function (assert) {
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

      // The explanation line already carries the whole story, so the empty
      // target box and the redundant blocker chip stay hidden.
      assert.dom(selectors.root).exists();
      assert.dom(selectors.blockers).doesNotExist();
      assert.dom(selectors.blocker('TARGET_DATA_MISSING')).doesNotExist();
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

      assert.dom(selectors.callPath).doesNotExist();
      assert.dom(selectors.blockers).doesNotExist();
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

    // ─── Potential verdict ───────────────────────────────────────────────────
    test('it hides inconclusive reasons for potential verdicts', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.POTENTIALLY_REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
            blockers: ['TARGET_NOT_OBSERVED', 'TARGET_CAPABILITY_X'],
            witness_path: [
              {
                caller: 'MainActivity.onCreate',
                callee: 'Lcom/example/Parser;->parse(Ljava/lang/String;)V',
                edge_type: 'REFLECTION',
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      // The call path still renders — only the inconclusive blockers hide.
      assert.dom(selectors.callPath).exists();
      assert.dom(selectors.blockers).doesNotExist();
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
    // ─── Sections ─────────────────────────────────────────────────────────────
    test('it renders the narrative and the reasoning sections', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse()',
            blockers: [],
            witness_path: [
              {
                caller: 'Lcom/example/MainActivity;->onCreate()',
                callee: 'Lcom/example/Parser;->parse()',
              },
            ],
            targets: [
              {
                label: 'Lcom/example/Parser;->parse()',
                has_witness: true,
                narrative: 'On startup, Synth passes a YAML string to load.',
                reasoning:
                  'REACHABLE. The path resolved statically, and no step ' +
                  'depended on a modeled dispatch.',
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.narrative)
        .hasText('On startup, Synth passes a YAML string to load.');

      // The raw verdict token becomes the same chip used elsewhere rather
      // than being printed as prose.
      assert
        .dom(selectors.reasoningVerdict)
        .hasText(t('sbomModule.reachability.pathFound'));

      assert
        .dom(selectors.reasoningText)
        .includesText(
          'The path resolved statically, and no step depended on a modeled ' +
            'dispatch.'
        );

      assert.dom(selectors.reasoningText).doesNotIncludeText('REACHABLE.');
    });

    test('it keeps reasoning prose whole when it has no verdict prefix', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse()',
            blockers: [],
            witness_path: [],
            targets: [
              {
                label: 'Lcom/example/Parser;->parse()',
                reasoning: 'The path resolved statically end to end.',
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.reasoningVerdict).doesNotExist();
      assert
        .dom(selectors.reasoningText)
        .hasText('The path resolved statically end to end.');
    });

    test('it falls back to the legacy blob when sections are absent', async function (assert) {
      const store = this.owner.lookup('service:store');

      this.sbomVulnerabilityAudit = pushAudit(
        store,
        this.server.create('sbom-vulnerability-audit', {
          reachability: {
            verdict: ReachabilityVerdict.REACHABLE,
            target_presence: 'PRESENT',
            target: 'Lcom/example/Parser;->parse()',
            blockers: [],
            witness_path: [
              {
                caller: 'Lcom/example/MainActivity;->onCreate()',
                callee: 'Lcom/example/Parser;->parse()',
              },
            ],
            targets: [
              {
                label: 'Lcom/example/Parser;->parse()',
                explanation: 'App behavior: The confirmed prefix starts here.',
              },
            ],
          },
        })
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.narrative)
        .includesText('The confirmed prefix starts here.');
      assert.dom(selectors.reasoning).doesNotExist();
    });
  }
);
