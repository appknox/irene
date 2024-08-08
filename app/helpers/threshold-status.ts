import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

type ThresholdStatusLabels = 'Low' | 'Medium' | 'High' | 'Critical';

function thresholdStatus(params: (number | string)[]) {
  let status: number | null = null;

  try {
    status = parseInt(String(params[0]));
  } catch (_) {
    return '';
  }

  const statusLabels: Record<number, ThresholdStatusLabels> = {
    [ENUMS.THRESHOLD.LOW]: 'Low',
    [ENUMS.THRESHOLD.MEDIUM]: 'Medium',
    [ENUMS.THRESHOLD.HIGH]: 'High',
    [ENUMS.THRESHOLD.CRITICAL]: 'Critical',
  };

  return statusLabels[status] || '';
}

const ThresholdStatusHelper = helper(thresholdStatus);

export { thresholdStatus };

export default ThresholdStatusHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'threshold-status': typeof ThresholdStatusHelper;
  }
}
