/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function thresholdStatus(params) {
  let status = null;
  try {
    status = parseInt(params[0]);
  } catch(_) {
    return ''
  }
  const statusLabels = {
    [ENUMS.THRESHOLD.LOW]: 'Low',
    [ENUMS.THRESHOLD.MEDIUM]: 'Medium',
    [ENUMS.THRESHOLD.HIGH]: 'High',
    [ENUMS.THRESHOLD.CRITICAL]: 'Critical',
  }
  return statusLabels[status] || '';
}

export default helper(thresholdStatus);
