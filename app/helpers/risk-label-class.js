import { helper } from '@ember/component/helper';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

export function riskLabelClass(params) {
  const riskStatus = analysisRiskStatus(params);
  return riskStatus.cssclass;
}

export default helper(riskLabelClass);
