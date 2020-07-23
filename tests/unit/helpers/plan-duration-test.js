import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { planDuration } from 'irene/helpers/plan-duration';

module('Unit | Helper | device type', function() {
  test('it works', function(assert) {
    assert.equal(planDuration([42]), "yearly", "Yearly");
    assert.equal(planDuration([ENUMS.PAYMENT_DURATION.MONTHLY]), "monthly", "Monthly");
    assert.equal(planDuration([ENUMS.PAYMENT_DURATION.QUARTERLY]), "quarterly", "Quarterly");
    assert.equal(planDuration([ENUMS.PAYMENT_DURATION.HALFYEARLY]), "halfYearly", "Half Yearly");
  });
});
