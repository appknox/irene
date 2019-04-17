import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function manualScanStatus(params) {

  const currentRole = params[0];

  if (currentRole === ENUMS.MANUAL.NONE) {
    return "Not started";
  } else if (currentRole === ENUMS.MANUAL.REQUESTED) {
    return "Requested";
  } else if (currentRole === ENUMS.MANUAL.ASSESSING) {
    return "In progress";
  }else if (currentRole === ENUMS.MANUAL.DONE) {
    return "Completed";
  }
}


export default helper(manualScanStatus);
