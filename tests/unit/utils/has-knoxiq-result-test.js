import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import hasKnoxiqResult from 'irene/utils/has-knoxiq-result';

module('Unit | Utility | has-knoxiq-result', function () {
  test.each(
    'reports a KnoxIQ verdict only once one exists',
    [
      // [analysis, expected]
      [{ exploitabilityLikelihood: ENUMS.KNOXIQ_EXPLOITABILITY.LOW }, true],
      [{ exploitabilityLikelihood: ENUMS.KNOXIQ_EXPLOITABILITY.MEDIUM }, true],
      [{ exploitabilityLikelihood: ENUMS.KNOXIQ_EXPLOITABILITY.HIGH }, true],

      // a verdict of "every finding is a false positive" counts too
      [{ isKnoxiqAllFp: true }, true],
      [
        {
          isKnoxiqAllFp: true,
          exploitabilityLikelihood: ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN,
        },
        true,
      ],

      // nothing scored yet
      [
        { exploitabilityLikelihood: ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN },
        false,
      ],
      [{ exploitabilityLikelihood: null }, false],
      [{ exploitabilityLikelihood: undefined }, false],
      [{}, false],
    ],
    function (assert, [analysis, expected]) {
      assert.strictEqual(hasKnoxiqResult(analysis), expected);
    }
  );
});
