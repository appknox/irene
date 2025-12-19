/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function analysisStatus(params) {
  let risk = params[0];
  if(typeof risk === "object") {
    risk = risk.value;
  }
  risk = parseInt(risk);
  const statuses = {
    [ENUMS.ANALYSIS_STATUS.ERROR]: "Errored",
    [ENUMS.ANALYSIS_STATUS.WAITING]: "Not started",
    [ENUMS.ANALYSIS_STATUS.RUNNING]: "Scanning",
    [ENUMS.ANALYSIS_STATUS.COMPLETED]: "Completed",
    [ENUMS.ANALYSIS_STATUS.UNKNOWN]: "Unknown",
  }
  return statuses[risk] || '';
}

export default helper(analysisStatus);
