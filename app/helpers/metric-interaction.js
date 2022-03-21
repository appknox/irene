/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function metricInteraction(params) {
  let impact = params[0];
  if(typeof impact === "object") {
    impact = impact.value;
  }
  switch (impact) {
    case ENUMS.USER_INTERACTION.NOT_REQUIRED: return "NOT REQUIRED";
    case ENUMS.USER_INTERACTION.REQUIRED: return "REQUIRED";
    case ENUMS.USER_INTERACTION.UNKNOWN: return "UNKNOWN";
    default: return impact;
  }
}

export default helper(metricInteraction);
