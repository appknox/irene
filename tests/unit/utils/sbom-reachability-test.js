import { module, test } from 'qunit';
import {
  ReachabilityVerdict,
  blockerLabelKey,
  isQuietReachabilityVerdict,
  presenceLabelKey,
  reachabilityChipColor,
  reachabilityLabelKey,
  reachabilityWitnessSteps,
  shouldShowReachabilityChip,
  shouldShowReachabilityDetail,
} from 'irene/utils/sbom-reachability';

module('Unit | Utility | sbom-reachability', function () {
  test('path-found verdicts show a primary chip', function (assert) {
    assert.true(shouldShowReachabilityChip(ReachabilityVerdict.REACHABLE));
    assert.true(
      shouldShowReachabilityChip(ReachabilityVerdict.CONFIRMED_REACHABLE)
    );
    assert.strictEqual(
      reachabilityChipColor(ReachabilityVerdict.CONFIRMED_REACHABLE),
      'primary'
    );
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.REACHABLE),
      'sbomModule.reachability.pathFound'
    );
  });

  test('potential verdicts show a warn chip', function (assert) {
    assert.true(
      shouldShowReachabilityChip(ReachabilityVerdict.POTENTIALLY_REACHABLE)
    );
    assert.strictEqual(
      reachabilityChipColor(ReachabilityVerdict.POTENTIALLY_REACHABLE),
      'warn'
    );
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.POTENTIALLY_REACHABLE),
      'sbomModule.reachability.potential'
    );
  });

  test('no path found is a default chip, not success', function (assert) {
    assert.true(shouldShowReachabilityChip(ReachabilityVerdict.NO_PATH_FOUND));
    assert.strictEqual(
      reachabilityChipColor(ReachabilityVerdict.NO_PATH_FOUND),
      'default'
    );
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.NO_PATH_FOUND),
      'sbomModule.reachability.noPathFound'
    );
  });

  test('unknown and unsupported are quiet on closed rows', function (assert) {
    assert.true(isQuietReachabilityVerdict(ReachabilityVerdict.UNKNOWN));
    assert.true(isQuietReachabilityVerdict(ReachabilityVerdict.UNSUPPORTED));
    assert.true(isQuietReachabilityVerdict(null));
    assert.false(shouldShowReachabilityChip(ReachabilityVerdict.UNKNOWN));
    assert.false(shouldShowReachabilityChip(null));
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.UNKNOWN),
      'unknown'
    );
    assert.strictEqual(
      reachabilityLabelKey(ReachabilityVerdict.UNSUPPORTED),
      'sbomModule.reachability.unsupported'
    );
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

  test('known blockers have translation keys and unknown codes do not', function (assert) {
    assert.strictEqual(
      blockerLabelKey('TARGET_DATA_MISSING'),
      'sbomModule.reachability.blockerLabels.targetDataMissing'
    );
    assert.strictEqual(blockerLabelKey('SOME_NEW_CODE'), null);
  });

  test('witness steps flatten caller then callees', function (assert) {
    const steps = reachabilityWitnessSteps([
      { caller: 'A', callee: 'B' },
      { caller: 'B', callee: 'C' },
    ]);

    assert.deepEqual(steps, ['A', 'B', 'C']);
    assert.deepEqual(reachabilityWitnessSteps([]), []);
    assert.deepEqual(reachabilityWitnessSteps(null), []);
  });

  test('detail panel hides empty unknown findings', function (assert) {
    assert.false(shouldShowReachabilityDetail(null));
    assert.false(
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
