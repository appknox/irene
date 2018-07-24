import Ember from 'ember';
import ENUMS from 'irene/enums';

export function metricImpact(params) {
  let impact = params[0];
  if(typeof impact === "object") {
    impact = impact.value;
  }
  switch (impact) {
    case ENUMS.IMPACTS.NONE: return "NONE";
    case ENUMS.IMPACTS.LOW: return "LOW";
    case ENUMS.IMPACTS.HIGH: return "HIGH";
    case ENUMS.IMPACTS.UNKNOWN: return "UNKNOWN";
    default: return impact;
  }
}

export default Ember.Helper.helper(metricImpact);
