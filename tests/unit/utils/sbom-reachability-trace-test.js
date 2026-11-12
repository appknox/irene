import { module, test } from 'qunit';
import {
  FindingExposure,
  ReachabilityVerdict,
  findingDisplayVerdict,
  isConfirmedFinding,
  isTargetCallStatusUnknown,
  reachabilityNamedExplanationKey,
  tokenizeReasoning,
} from 'irene/utils/sbom-reachability';

const PATH = [
  {
    caller: 'Lcom/example/MainActivity;->onCreate()V',
    callee: 'Lcom/example/Parser;->parse()V',
  },
];

module('Unit | Utility | sbom-reachability | trace', function () {
  // ─── tokenizeReasoning ────────────────────────────────────────────────────
  test('it returns no segments for empty reasoning', function (assert) {
    assert.deepEqual(tokenizeReasoning(null), []);
    assert.deepEqual(tokenizeReasoning(''), []);
  });

  test('it keeps prose without verdicts as one text segment', function (assert) {
    assert.deepEqual(
      tokenizeReasoning('The path is reachable from onCreate.'),
      [{ kind: 'text', text: 'The path is reachable from onCreate.' }],
      'lower-case "reachable" is ordinary prose'
    );
  });

  test('it consumes a leading raw verdict token with its punctuation', function (assert) {
    assert.deepEqual(
      tokenizeReasoning('POTENTIALLY_REACHABLE: The call is dynamic.'),
      [
        {
          kind: 'verdict',
          verdict: ReachabilityVerdict.POTENTIALLY_REACHABLE,
          raw: 'POTENTIALLY_REACHABLE',
        },
        { kind: 'text', text: ' The call is dynamic.' },
      ]
    );
  });

  test('it leaves an unknown leading token as prose', function (assert) {
    assert.deepEqual(tokenizeReasoning('NOTE: check the build.'), [
      { kind: 'text', text: 'NOTE: check the build.' },
    ]);
  });

  test('it turns every inline verdict into a chip segment', function (assert) {
    const segments = tokenizeReasoning(
      'That leaves the result INCONCLUSIVE. It is Reachable only if loaded, ' +
        'but Potentially Reachable once the plugin loads; Inconclusive for now.'
    );

    assert.deepEqual(
      segments.filter((s) => s.kind === 'verdict').map((s) => s.verdict),
      [
        ReachabilityVerdict.UNKNOWN,
        ReachabilityVerdict.REACHABLE,
        ReachabilityVerdict.POTENTIALLY_REACHABLE,
        ReachabilityVerdict.UNKNOWN,
      ]
    );

    assert.strictEqual(
      segments.map((s) => (s.kind === 'text' ? s.text : `[${s.raw}]`)).join(''),
      'That leaves the result [INCONCLUSIVE]. It is [Reachable] only if loaded, ' +
        'but [Potentially Reachable] once the plugin loads; [Inconclusive] for now.',
      'the prose around each chip is preserved verbatim'
    );
  });

  test('it never splits a longer verdict phrase into a shorter chip', function (assert) {
    const verdicts = tokenizeReasoning(
      'CONFIRMED_REACHABLE vs NOT_REACHABLE vs Not reachable vs NO_PATH_FOUND'
    )
      .filter((s) => s.kind === 'verdict')
      .map((s) => s.verdict);

    assert.deepEqual(verdicts, [
      ReachabilityVerdict.CONFIRMED_REACHABLE,
      ReachabilityVerdict.NO_PATH_FOUND,
      ReachabilityVerdict.NO_PATH_FOUND,
      ReachabilityVerdict.NO_PATH_FOUND,
    ]);
  });

  test('a negated verdict becomes the not-reachable chip', function (assert) {
    const segments = tokenizeReasoning(
      'It is not Reachable, and not reachable.'
    );

    assert.deepEqual(segments, [
      { kind: 'text', text: 'It is ' },
      {
        kind: 'verdict',
        verdict: ReachabilityVerdict.NO_PATH_FOUND,
        raw: 'not Reachable',
      },
      { kind: 'text', text: ', and not reachable.' },
    ]);
  });

  test('it ignores verdict words embedded in other words', function (assert) {
    assert.deepEqual(tokenizeReasoning('Unreachable and REACHABLEX code.'), [
      { kind: 'text', text: 'Unreachable and REACHABLEX code.' },
    ]);
  });

  test('it keeps markup in reasoning as plain text', function (assert) {
    assert.deepEqual(tokenizeReasoning('<b>Reachable</b>'), [
      { kind: 'text', text: '<b>' },
      {
        kind: 'verdict',
        verdict: ReachabilityVerdict.REACHABLE,
        raw: 'Reachable',
      },
      { kind: 'text', text: '</b>' },
    ]);
  });

  // ─── Display verdict / confirmation ───────────────────────────────────────
  test('the folded exposure wins over the raw verdict', function (assert) {
    assert.strictEqual(
      findingDisplayVerdict({
        verdict: ReachabilityVerdict.REACHABLE,
        exposure: FindingExposure.POTENTIAL,
      }),
      ReachabilityVerdict.POTENTIALLY_REACHABLE
    );
    assert.strictEqual(
      findingDisplayVerdict({ verdict: ReachabilityVerdict.UNKNOWN }),
      ReachabilityVerdict.UNKNOWN
    );
    assert.strictEqual(findingDisplayVerdict(null), null);
  });

  test('only a proven path is a confirmed finding', function (assert) {
    assert.true(isConfirmedFinding({ exposure: FindingExposure.CONFIRMED }));
    assert.true(
      isConfirmedFinding({ verdict: ReachabilityVerdict.CONFIRMED_REACHABLE })
    );
    assert.false(isConfirmedFinding({ exposure: FindingExposure.POTENTIAL }));
    assert.false(isConfirmedFinding({ verdict: ReachabilityVerdict.UNKNOWN }));
    assert.false(isConfirmedFinding(null));
  });

  // ─── isTargetCallStatusUnknown ────────────────────────────────────────────
  test('inconclusive findings never claim which targets are called', function (assert) {
    assert.true(
      isTargetCallStatusUnknown({
        verdict: ReachabilityVerdict.UNKNOWN,
        witness_path: PATH,
      })
    );
    assert.true(
      isTargetCallStatusUnknown({
        verdict: ReachabilityVerdict.REACHABLE,
        exposure: FindingExposure.UNKNOWN,
      })
    );
  });

  test('a finding with no trace has an unknown call status', function (assert) {
    assert.true(
      isTargetCallStatusUnknown({
        verdict: ReachabilityVerdict.POTENTIALLY_REACHABLE,
        witness_path: [],
        targets: [{ label: 'x', has_witness: false }],
      })
    );
  });

  test('a traced or proven-absent finding keeps the called split', function (assert) {
    assert.false(
      isTargetCallStatusUnknown({
        verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
        witness_path: PATH,
      })
    );
    assert.false(
      isTargetCallStatusUnknown({
        verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
        targets: [{ label: 'x', has_witness: true }],
      })
    );
    assert.false(
      isTargetCallStatusUnknown({ verdict: ReachabilityVerdict.NO_PATH_FOUND })
    );
    assert.false(isTargetCallStatusUnknown(null));
  });

  // ─── Named explanation ───────────────────────────────────────────────────
  test('only verdicts that mention the app have a named explanation', function (assert) {
    assert.strictEqual(
      reachabilityNamedExplanationKey(ReachabilityVerdict.REACHABLE),
      'sbomModule.reachability.explanationNamed.reachable'
    );
    assert.strictEqual(
      reachabilityNamedExplanationKey(ReachabilityVerdict.NO_PATH_FOUND),
      'sbomModule.reachability.explanationNamed.noPathFound'
    );
    assert.strictEqual(
      reachabilityNamedExplanationKey(ReachabilityVerdict.UNKNOWN),
      null
    );
    assert.strictEqual(
      reachabilityNamedExplanationKey(
        ReachabilityVerdict.POTENTIALLY_REACHABLE
      ),
      null
    );
  });
});
