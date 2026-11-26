import { module, test } from 'qunit';
import {
  ReachabilityVerdict,
  blockerCategoryKey,
  fixHereWitnessIndex,
  formatDexSignature,
  groupWitnessByOwner,
  isQuietReachabilityVerdict,
  isReachableOrPotentialFinding,
  presenceLabelKey,
  reachabilityChipColor,
  reachabilityChipVariant,
  reachabilityExplanationKey,
  reachabilityLabelKey,
  reachabilityWitnessItems,
  reachabilityWitnessPathItems,
  shortSignature,
  splitWitnessNarrative,
  shouldShowReachabilityChip,
  shouldShowReachabilityDetail,
  splitFindingTargets,
} from 'irene/utils/sbom-reachability';

module('Unit | Utility | sbom-reachability', function () {
  test('path-found verdicts show a filled error chip', function (assert) {
    assert.expect(15);

    for (const verdict of [
      ReachabilityVerdict.REACHABLE,
      ReachabilityVerdict.CONFIRMED_REACHABLE,
      ReachabilityVerdict.CONDITION_MET,
    ]) {
      assert.true(shouldShowReachabilityChip(verdict));
      assert.strictEqual(reachabilityChipColor(verdict), 'error');
      assert.strictEqual(reachabilityChipVariant(verdict), 'filled');
      assert.strictEqual(
        reachabilityLabelKey(verdict),
        'sbomModule.reachability.pathFound'
      );
      assert.strictEqual(
        reachabilityExplanationKey(verdict),
        'sbomModule.reachability.explanation.reachable'
      );
    }
  });

  test('potential verdicts show a warn chip', function (assert) {
    assert.expect(10);

    for (const verdict of [
      ReachabilityVerdict.POTENTIALLY_REACHABLE,
      ReachabilityVerdict.CONDITION_POSSIBLY_MET,
    ]) {
      assert.true(shouldShowReachabilityChip(verdict));
      assert.strictEqual(reachabilityChipColor(verdict), 'warn');
      assert.strictEqual(reachabilityChipVariant(verdict), 'semi-filled');
      assert.strictEqual(
        reachabilityLabelKey(verdict),
        'sbomModule.reachability.potential'
      );
      assert.strictEqual(
        reachabilityExplanationKey(verdict),
        'sbomModule.reachability.explanation.potential'
      );
    }
  });

  test('no path found is a default chip, not success', function (assert) {
    assert.expect(8);

    for (const verdict of [
      ReachabilityVerdict.NO_PATH_FOUND,
      ReachabilityVerdict.CONDITION_NOT_MET,
    ]) {
      assert.true(shouldShowReachabilityChip(verdict));
      assert.strictEqual(reachabilityChipColor(verdict), 'default');
      assert.strictEqual(
        reachabilityLabelKey(verdict),
        'sbomModule.reachability.noPathFound'
      );
      assert.strictEqual(
        reachabilityExplanationKey(verdict),
        'sbomModule.reachability.explanation.noPathFound'
      );
    }
  });

  test('unknown shows an inconclusive chip; unsupported shows its label', function (assert) {
    assert.true(shouldShowReachabilityChip(ReachabilityVerdict.UNKNOWN));
    assert.true(shouldShowReachabilityChip(ReachabilityVerdict.UNSUPPORTED));
    assert.false(shouldShowReachabilityChip(null));
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.UNKNOWN),
      'sbomModule.reachability.inconclusive'
    );
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.UNSUPPORTED),
      'sbomModule.reachability.unsupported'
    );
    assert.strictEqual(
      reachabilityExplanationKey(ReachabilityVerdict.UNKNOWN),
      'sbomModule.reachability.explanation.inconclusive'
    );
    assert.strictEqual(
      reachabilityExplanationKey(ReachabilityVerdict.UNSUPPORTED),
      'sbomModule.reachability.explanation.unsupported'
    );
    // Detail-panel gating still treats unknown/unsupported as quiet.
    assert.true(isQuietReachabilityVerdict(ReachabilityVerdict.UNKNOWN));
    assert.true(isQuietReachabilityVerdict(ReachabilityVerdict.UNSUPPORTED));
    assert.true(isQuietReachabilityVerdict(null));
  });

  test('unrecognized verdicts fall back to inconclusive', function (assert) {
    assert.strictEqual(
      reachabilityLabelKey('SOME_FUTURE_VERDICT'),
      'sbomModule.reachability.inconclusive'
    );
    assert.strictEqual(reachabilityChipColor('SOME_FUTURE_VERDICT'), 'default');
  });

  test('presence labels map Enola presence values', function (assert) {
    assert.strictEqual(
      presenceLabelKey('PRESENT'),
      'sbomModule.reachability.presentInVersion'
    );
    assert.strictEqual(
      presenceLabelKey('NOT_OBSERVED'),
      'sbomModule.reachability.notObserved'
    );
    assert.strictEqual(
      presenceLabelKey('AMBIGUOUS'),
      'sbomModule.reachability.ambiguous'
    );
    assert.strictEqual(
      presenceLabelKey(''),
      'sbomModule.reachability.noReviewedTarget'
    );
  });

  test('blocker codes map to customer-facing categories', function (assert) {
    assert.expect(25);

    const cases = [
      ['TARGET_DATA_MISSING', 'noTargetData'],
      ['TARGET_NOT_OBSERVED', 'notInBinary'],
      ['COMPONENT_CODE_NOT_OBSERVED', 'notInBinary'],
      ['IOS_TARGET_SYMBOL_NOT_OBSERVED', 'notInBinary'],
      ['IOS_TARGET_SYMBOL_AMBIGUOUS', 'ambiguousSymbol'],
      ['IOS_ENTRY_ROOT_NOT_OBSERVED', 'iosEntryPoint'],
      ['IOS_DIRECT_CALL_PATH_NOT_FOUND', 'iosIndirectCalls'],
      ['IOS_INDIRECT_DISPATCH_UNMODELED', 'iosIndirectCalls'],
      ['R8_INLINING_UNRESOLVED', 'obfuscation'],
      ['R8_MAPPING_SOMETHING', 'obfuscation'],
      ['REFLECTION_METHOD_DYNAMIC', 'dynamicCode'],
      ['DYNAMIC_CODE_LOADING', 'dynamicCode'],
      ['NESTED_DEX_LOADER_MISMATCH', 'dynamicCode'],
      ['JNI_REGISTER_NATIVES', 'nativeBoundary'],
      ['FLUTTER_CHANNEL_METHOD_CALL_UNRESOLVED', 'framework'],
      ['HERMES_ANALYSIS_FAILED', 'framework'],
      ['REACT_NATIVE_BUNDLE_CALL_UNRESOLVED', 'framework'],
      ['TARGET_CAPABILITY_IDENTITY_ONLY', 'limitedEvidence'],
      ['TARGET_CAPABILITY_NOT_NEGATIVE_COMPLETE', 'limitedEvidence'],
      ['ARTIFACT_NOT_MATERIALIZED', 'artifact'],
      ['INSTALLED_SPLIT_SET_MISSING', 'artifact'],
      ['INSUFFICIENT_MEMORY', 'resourceLimit'],
      ['HERMES_BUNDLE_SIZE_LIMIT_EXCEEDED', 'resourceLimit'],
      ['HERMESC_TIMEOUT', 'resourceLimit'],
      ['SOME_NEW_CODE', 'other'],
    ];

    for (const [code, category] of cases) {
      assert.strictEqual(
        blockerCategoryKey(code),
        `sbomModule.reachability.blockerCategories.${category}`,
        code
      );
    }
  });

  test('formatDexSignature renders Java form', function (assert) {
    assert.strictEqual(
      formatDexSignature('Lcom/example/Parser;->parse(Ljava/lang/String;)V'),
      'com.example.Parser.parse(java.lang.String)'
    );
    assert.strictEqual(
      formatDexSignature('La/b/C$Inner;->m(I[Lokio/Buffer;Z)J'),
      'a.b.C.Inner.m(int, okio.Buffer[], boolean)'
    );
    assert.strictEqual(formatDexSignature('La/b/C;-><init>()V'), 'a.b.C.C()');
    assert.strictEqual(
      formatDexSignature('Lcom/example/Parser;->parse'),
      'com.example.Parser.parse'
    );
    // Non-DEX signatures pass through unchanged.
    assert.strictEqual(formatDexSignature('Parser.parse'), 'Parser.parse');
    assert.strictEqual(formatDexSignature('JNI:foo'), 'JNI:foo');
  });

  test('witness items flatten caller then callees with edge types', function (assert) {
    const items = reachabilityWitnessItems([
      {
        caller: 'LA;->a()V',
        callee: 'LB;->b()V',
        edge_type: 'XML_CALLBACK',
      },
      { caller: 'LB;->b()V', callee: 'LC;->c()V' },
    ]);

    assert.deepEqual(items, [
      {
        signature: 'LA;->a()V',
        display: 'A.a()',
        shortDisplay: 'A.a()',
        packageName: null,
        edgeType: undefined,
        note: null,
        owner: null,
      },
      {
        signature: 'LB;->b()V',
        display: 'B.b()',
        shortDisplay: 'B.b()',
        packageName: null,
        edgeType: 'XML_CALLBACK',
        note: null,
        owner: null,
      },
      {
        signature: 'LC;->c()V',
        display: 'C.c()',
        shortDisplay: 'C.c()',
        packageName: null,
        edgeType: undefined,
        note: null,
        owner: null,
      },
    ]);

    assert.deepEqual(reachabilityWitnessItems([]), []);
    assert.deepEqual(reachabilityWitnessItems(null), []);
  });

  test('detail panel hides empty unknown findings', function (assert) {
    assert.false(shouldShowReachabilityDetail(null));
    assert.false(
      shouldShowReachabilityDetail({
        verdict: ReachabilityVerdict.UNKNOWN,
        blockers: [],
      })
    );
    assert.true(
      shouldShowReachabilityDetail({
        verdict: ReachabilityVerdict.UNKNOWN,
        blockers: ['TARGET_DATA_MISSING'],
      })
    );
    assert.true(
      shouldShowReachabilityDetail({
        verdict: ReachabilityVerdict.NO_PATH_FOUND,
        target: 'Lcom/example/Parser;->parse()V',
        blockers: [],
      })
    );
    assert.true(
      shouldShowReachabilityDetail({
        verdict: ReachabilityVerdict.UNSUPPORTED,
        target: 'Lcom/example/Native;->decode()V',
        blockers: ['JNI_REGISTER_NATIVES'],
      })
    );
  });
  // ─── Short signatures ─────────────────────────────────────────────────────
  test('short signatures split package from Class.method()', function (assert) {
    assert.deepEqual(
      shortSignature('Lorg/horaapps/leafpic/util/BackupHelper;->restore()'),
      {
        packageName: 'org.horaapps.leafpic.util',
        display: 'BackupHelper.restore()',
      }
    );

    // Nested classes keep `$`, unlike the full Java-form rendering.
    assert.deepEqual(
      shortSignature(
        'Lcom/fasterxml/jackson/databind/deser/std/UntypedObjectDeserializer$Vanilla;->deserialize(Lcom/fasterxml/jackson/core/JsonParser;)Ljava/lang/Object;'
      ),
      {
        packageName: 'com.fasterxml.jackson.databind.deser.std',
        display: 'UntypedObjectDeserializer$Vanilla.deserialize()',
      }
    );

    // Already-dotted signatures split on the last two segments.
    assert.deepEqual(
      shortSignature('com.example.Parser.parse(java.lang.String)'),
      {
        packageName: 'com.example',
        display: 'Parser.parse()',
      }
    );

    // Mangled symbols with no dots pass through whole.
    assert.deepEqual(shortSignature('$s8MyAppMain'), {
      packageName: null,
      display: '$s8MyAppMain',
    });
  });

  // ─── Witness nodes ────────────────────────────────────────────────────────
  test('witness nodes are preferred over edge-derived frames', function (assert) {
    const items = reachabilityWitnessPathItems({
      witness_nodes: [
        {
          signature: 'Lcom/example/MainActivity;->onCreate()',
          note: 'User opens the app',
          owner: { kind: 'APP', label: 'Example' },
        },
      ],
      witness_path: [
        { caller: 'Lcom/other/A;->a()', callee: 'Lcom/other/B;->b()' },
      ],
    });

    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].shortDisplay, 'MainActivity.onCreate()');
    assert.strictEqual(items[0].note, 'User opens the app');
    assert.strictEqual(items[0].owner.kind, 'APP');
  });

  test('without nodes the path is derived from edges and carries no annotations', function (assert) {
    const items = reachabilityWitnessPathItems({
      witness_path: [
        {
          caller: 'Lcom/example/MainActivity;->onCreate()',
          callee: 'Lcom/example/Parser;->parse()',
        },
      ],
    });

    assert.deepEqual(
      items.map((item) => item.shortDisplay),
      ['MainActivity.onCreate()', 'Parser.parse()']
    );
    assert.strictEqual(items[0].owner, null);
    assert.strictEqual(items[0].note, null);
  });

  // ─── Owner grouping ───────────────────────────────────────────────────────
  test('consecutive frames with the same owner collapse into one group', function (assert) {
    const app = { kind: 'APP', label: 'LeafPic' };
    const lib = { kind: 'COMPONENT', label: 'jackson-databind 2.9.8' };

    const groups = groupWitnessByOwner([
      { signature: 'a', owner: app },
      { signature: 'b', owner: app },
      { signature: 'c', owner: lib },
    ]);

    assert.deepEqual(
      groups.map((group) => [group.kind, group.label, group.items.length]),
      [
        ['APP', 'LeafPic', 2],
        ['COMPONENT', 'jackson-databind 2.9.8', 1],
      ]
    );
  });

  test('unowned frames form a single anonymous group', function (assert) {
    const groups = groupWitnessByOwner([
      { signature: 'a' },
      { signature: 'b' },
    ]);

    assert.strictEqual(groups.length, 1);
    assert.strictEqual(groups[0].kind, null);
    assert.strictEqual(groups[0].label, null);
  });

  // ─── Fix-here frame ───────────────────────────────────────────────────────
  test('fix-here is the last app frame before control leaves the app', function (assert) {
    const app = { kind: 'APP' };
    const lib = { kind: 'COMPONENT' };

    assert.strictEqual(
      fixHereWitnessIndex([
        { signature: 'a', owner: app },
        { signature: 'b', owner: app },
        { signature: 'c', owner: lib },
        { signature: 'd', owner: lib },
      ]),
      1
    );

    // A path that re-enters app code still points at the final hand-off.
    assert.strictEqual(
      fixHereWitnessIndex([
        { signature: 'a', owner: app },
        { signature: 'b', owner: lib },
        { signature: 'c', owner: app },
        { signature: 'd', owner: lib },
      ]),
      2
    );

    assert.strictEqual(
      fixHereWitnessIndex([{ signature: 'a' }, { signature: 'b' }]),
      -1
    );

    // An entirely app-owned path never leaves, so nothing is marked.
    assert.strictEqual(
      fixHereWitnessIndex([
        { signature: 'a', owner: app },
        { signature: 'b', owner: app },
      ]),
      -1
    );
  });

  // ─── Target split ─────────────────────────────────────────────────────────
  test('targets split on has_witness when the backend supplies it', function (assert) {
    const split = splitFindingTargets({
      targets: [
        { label: 'a', has_witness: false },
        { label: 'b', has_witness: true },
      ],
    });

    assert.deepEqual(
      split.called.map((target) => target.label),
      ['b']
    );
    assert.deepEqual(
      split.alsoAffected.map((target) => target.label),
      ['a']
    );
  });

  test('without has_witness the headline target is called only when a path exists', function (assert) {
    const targets = [{ label: 'a' }, { label: 'b' }];

    const withPath = splitFindingTargets({
      targets,
      witness_path: [{ caller: 'x', callee: 'y' }],
    });

    assert.deepEqual(
      withPath.called.map((target) => target.label),
      ['a']
    );
    assert.deepEqual(
      withPath.alsoAffected.map((target) => target.label),
      ['b']
    );

    const withoutPath = splitFindingTargets({ targets, witness_path: [] });

    assert.deepEqual(withoutPath.called, []);
    assert.deepEqual(
      withoutPath.alsoAffected.map((target) => target.label),
      ['a', 'b']
    );
  });

  test('an empty finding splits into nothing', function (assert) {
    assert.deepEqual(splitFindingTargets(null), {
      called: [],
      alsoAffected: [],
    });
    assert.deepEqual(splitFindingTargets({ targets: [] }), {
      called: [],
      alsoAffected: [],
    });
  });
  // ─── Narrative ────────────────────────────────────────────────────────────
  test('the engine narrative splits into behavior and analyst detail', function (assert) {
    const result = splitWitnessNarrative(
      'App behavior: The witness starts at onCreate.\n\n' +
        'Analyst assessment: The first uncertain transition is ' +
        'Lcom/a/B;->c()V -> Lcom/d/E;->f()V.'
    );

    assert.strictEqual(result.behavior, 'The witness starts at onCreate.');
    assert.strictEqual(
      result.detail,
      'The first uncertain transition is Lcom/a/B;->c()V -> Lcom/d/E;->f()V.'
    );
  });

  test('a narrative without an analyst part has no detail', function (assert) {
    const result = splitWitnessNarrative('App behavior: It just works.');

    assert.strictEqual(result.behavior, 'It just works.');
    assert.strictEqual(result.detail, null);
  });

  test('an unlabelled narrative is kept whole as behavior', function (assert) {
    const result = splitWitnessNarrative('When a user imports a backup…');

    assert.strictEqual(result.behavior, 'When a user imports a backup…');
    assert.strictEqual(result.detail, null);
  });

  test('an empty narrative splits to nothing', function (assert) {
    assert.strictEqual(splitWitnessNarrative(null), null);
    assert.strictEqual(splitWitnessNarrative('   '), null);
  });

  test('reachable-or-potential follows the display verdict', function (assert) {
    // Exposure wins when present.
    assert.true(
      isReachableOrPotentialFinding({ exposure: 'CONFIRMED_EXPOSURE' })
    );
    assert.true(
      isReachableOrPotentialFinding({ exposure: 'POTENTIAL_EXPOSURE' })
    );
    assert.false(
      isReachableOrPotentialFinding({
        exposure: 'NO_EXPOSURE_OBSERVED',
        verdict: 'REACHABLE',
      })
    );

    // Without an exposure, the raw verdict decides.
    assert.true(isReachableOrPotentialFinding({ verdict: 'REACHABLE' }));
    assert.true(
      isReachableOrPotentialFinding({ verdict: 'POTENTIALLY_REACHABLE' })
    );
    assert.false(isReachableOrPotentialFinding({ verdict: 'NO_PATH_FOUND' }));
    assert.false(isReachableOrPotentialFinding({ verdict: 'UNKNOWN' }));
    assert.false(isReachableOrPotentialFinding(null));
  });
});
