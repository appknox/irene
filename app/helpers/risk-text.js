import Ember from 'ember';
import ENUMS from 'irene/enums';

export function riskText(params) {

  let risk = params[0];

  if(typeof risk === "object") {
    risk = risk.value;
  }

  switch (risk) {
    case ENUMS.RISK.UNKNOWN: return "untested";
    case ENUMS.RISK.NONE: return "passed";
    case ENUMS.RISK.LOW: return "low";
    case ENUMS.RISK.MEDIUM: return "medium";
    case ENUMS.RISK.HIGH: return "high";
    case ENUMS.RISK.CRITICAL: return "critical";
  }
}

export default Ember.Helper.helper(riskText);
