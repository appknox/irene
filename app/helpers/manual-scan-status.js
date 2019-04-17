import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function manualScanStatus(params) {

  const currentRole = params[0];

  if (currentRole === ENUMS.MANUAL.NONE) {
    return "None";
  } else if (currentRole === ENUMS.MANUAL.REQUESTED) {
    return "Requested";
  } else if (currentRole === ENUMS.MANUAL.ASSESSING) {
    return "Assessing";
  }else if (currentRole === ENUMS.MANUAL.DONE) {
    return "Done";
  }
}


export default helper(manualScanStatus);
