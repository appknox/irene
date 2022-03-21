/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function manualScanStatus(params) {
  let status = null;
  try {
    status = parseInt(params[0]);
  } catch(_) {
    return ''
  }
  const statusLabels = {
    [ENUMS.MANUAL.NONE]: 'Not started',
    [ENUMS.MANUAL.REQUESTED]: 'Requested',
    [ENUMS.MANUAL.ASSESSING]: 'In progress',
    [ENUMS.MANUAL.DONE]: 'Completed',
  }
  return statusLabels[status] || '';
}

export default helper(manualScanStatus);
