import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function riskLabelClass(params) {
  let risk = params[0];
  if(typeof risk === "object") {
    risk = risk.value;
  }
  risk = parseInt(risk);
  switch (risk) {
    case ENUMS.RISK.UNKNOWN: return `is-progress`;
    case ENUMS.RISK.NONE: return `is-success`;
    case ENUMS.RISK.LOW: return `is-info`;
    case ENUMS.RISK.MEDIUM: return `is-warning`;
    case ENUMS.RISK.HIGH: return `is-danger`;
    case ENUMS.RISK.CRITICAL: return `is-critical`;
  }
}

export default helper(riskLabelClass);
