/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function metricVector(params) {
  let metric = params[0];
  if(typeof metric === "object") {
    metric = metric.value;
  }
  switch (metric) {
    case ENUMS.ATTACK_VECTOR.NETWORK: return "NETWORK";
    case ENUMS.ATTACK_VECTOR.ADJACENT: return "ADJACENT";
    case ENUMS.ATTACK_VECTOR.LOCAL: return "LOCAL";
    case ENUMS.ATTACK_VECTOR.PHYSICAL: return "PHYSICAL";
    case ENUMS.ATTACK_VECTOR.UNKNOWN: return "UNKNOWN";
    default: return metric;
  }
}

export default helper(metricVector);
