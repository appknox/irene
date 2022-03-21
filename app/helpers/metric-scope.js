/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function metricScope(params) {
  let impact = params[0];
  if(typeof impact === "object") {
    impact = impact.value;
  }
  switch (impact) {
    case ENUMS.SCOPE.UNCHANGED: return "UNCHANGED";
    case ENUMS.SCOPE.CHANGED: return "CHANGED";
    case ENUMS.SCOPE.UNKNOWN: return "UNKNOWN";
    default: return impact;
  }
}

export default helper(metricScope);
