import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import ENUMS from 'irene/enums';

module('Unit | Model | analysis-overview', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  // ─── needsKnoxiqReview ─────────────────────────────────────────────────────
  test.each(
    'needsKnoxiqReview is true only for an unactioned all-FP analysis',
    [
      // [isKnoxiqAllFp, risk, overriddenRisk, expected]
      [true, ENUMS.RISK.HIGH, null, true],
      [false, ENUMS.RISK.HIGH, null, false],

      // already actioned — the risk was overridden as Passed
      [true, ENUMS.RISK.HIGH, ENUMS.RISK.NONE, false],

      // overridden to a risk other than Passed, so it still needs review
      [true, ENUMS.RISK.HIGH, ENUMS.RISK.LOW, true],

      // passed by the system, so the override is not a human action
      [true, ENUMS.RISK.NONE, ENUMS.RISK.NONE, true],
    ],
    function (assert, [isKnoxiqAllFp, risk, overriddenRisk, expected]) {
      const analysis = this.store.createRecord('analysis-overview', {
        isKnoxiqAllFp,
        risk,
        overriddenRisk,
        computedRisk: risk,
      });

      assert.strictEqual(analysis.needsKnoxiqReview, expected);
    }
  );

  test('needsKnoxiqReview is false when the KnoxIQ flag is absent', function (assert) {
    const analysis = this.store.createRecord('analysis-overview', {
      risk: ENUMS.RISK.HIGH,
      computedRisk: ENUMS.RISK.HIGH,
      overriddenRisk: null,
    });

    assert.false(
      Boolean(analysis.needsKnoxiqReview),
      'an analysis the API has not flagged never lands in the review tab'
    );
  });
});
