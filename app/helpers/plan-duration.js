/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
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

const PlanDurationHelper = helper(planDuration);

export { planDuration };

export default PlanDurationHelper;
