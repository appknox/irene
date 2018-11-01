import { helper } from '@ember/component/helper'
import ENUMS from 'irene/enums';

export function analysisStatus(params) {
  let risk = params[0];
  if(typeof risk === "object") {
    risk = risk.value;
  }
  risk = parseInt(risk);
  switch (risk) {
    case ENUMS.ANALYSIS_STATUS.ERROR: return "ERROR";
    case ENUMS.ANALYSIS_STATUS.WAITING: return "WAITING";
    case ENUMS.ANALYSIS_STATUS.RUNNING: return "RUNNING";
    case ENUMS.ANALYSIS_STATUS.COMPLETED: return "COMPLETED";
    case ENUMS.ANALYSIS_STATUS.UNKNOWN: return "UNKNOWN";
    default: return risk;
  }
}

export default helper(analysisStatus);
