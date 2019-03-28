import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function riskLabelClass(params) {
  let risk = params[0];
  if (risk === null || risk === '') {
    return ''
  }
  if(typeof risk === "object") {
    risk = risk.value;
  }
  risk = parseInt(risk);
  const labels = {
    [ENUMS.RISK.UNKNOWN]: 'is-progress',
    [ENUMS.RISK.NONE]: 'is-success',
    [ENUMS.RISK.LOW]: 'is-info',
    [ENUMS.RISK.MEDIUM]: 'is-warning',
    [ENUMS.RISK.HIGH]: 'is-danger',
    [ENUMS.RISK.CRITICAL]: 'is-critical',
  }
  return labels[risk] || '';
}

export default helper(riskLabelClass);
