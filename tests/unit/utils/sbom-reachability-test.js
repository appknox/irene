import { module, test } from 'qunit';
import {
  ReachabilityVerdict,
  blockerCategoryKey,
  formatDexSignature,
  isInconclusiveVerdict,
  isQuietReachabilityVerdict,
  presenceLabelKey,
  reachabilityChipColor,
  reachabilityExplanationKey,
  reachabilityLabelKey,
  reachabilityWitnessItems,
  shouldShowReachabilityChip,
  shouldShowReachabilityDetail,
} from 'irene/utils/sbom-reachability';

module('Unit | Utility | sbom-reachability', function () {
  test('path-found verdicts show a primary chip', function (assert) {
    assert.expect(12);

    for (const verdict of [
      ReachabilityVerdict.REACHABLE,
      ReachabilityVerdict.CONFIRMED_REACHABLE,
      ReachabilityVerdict.CONDITION_MET,
    ]) {
      assert.true(shouldShowReachabilityChip(verdict));
      assert.strictEqual(reachabilityChipColor(verdict), 'primary');
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
    assert.expect(8);

    for (const verdict of [
      ReachabilityVerdict.POTENTIALLY_REACHABLE,
      ReachabilityVerdict.CONDITION_POSSIBLY_MET,
    ]) {
      assert.true(shouldShowReachabilityChip(verdict));
      assert.strictEqual(reachabilityChipColor(verdict), 'warn');
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

  test('inconclusive verdicts owe the customer a reason', function (assert) {
    assert.expect(9);

    for (const verdict of [
      ReachabilityVerdict.POTENTIALLY_REACHABLE,
      ReachabilityVerdict.CONDITION_POSSIBLY_MET,
      ReachabilityVerdict.UNKNOWN,
    ]) {
      assert.true(isInconclusiveVerdict(verdict));
    }

    for (const verdict of [
      ReachabilityVerdict.REACHABLE,
      ReachabilityVerdict.CONFIRMED_REACHABLE,
      ReachabilityVerdict.CONDITION_MET,
      ReachabilityVerdict.NO_PATH_FOUND,
      ReachabilityVerdict.CONDITION_NOT_MET,
      ReachabilityVerdict.UNSUPPORTED,
    ]) {
      assert.false(isInconclusiveVerdict(verdict));
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
      { signature: 'LA;->a()V', display: 'A.a()', edgeType: undefined },
      {
        signature: 'LB;->b()V',
        display: 'B.b()',
        edgeType: 'XML_CALLBACK',
      },
      { signature: 'LC;->c()V', display: 'C.c()', edgeType: undefined },
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
});
