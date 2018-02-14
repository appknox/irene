/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const planDuration = function(params) {
  const currentPlan = params[0];

  if (currentPlan === ENUMS.PAYMENT_DURATION.MONTHLY) {
    return "monthly";
  } else if (currentPlan === ENUMS.PAYMENT_DURATION.QUARTERLY) {
    return "quarterly";
  } else if (currentPlan === ENUMS.PAYMENT_DURATION.HALFYEARLY) {
    return "halfYearly";
  } else {
    return "yearly";
  }
};

const PlanDurationHelper = Ember.Helper.helper(planDuration);

export { planDuration };

export default PlanDurationHelper;
