import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function analysisRiskStatus(params: [string, string, boolean]) {
  let risk = null;
  let status = null;
  let isOverriddenRisk = false;

  try {
    risk = parseInt(params[0]);
  } catch (_) {
    // null risk
  }

  try {
    status = parseInt(params[1]);
  } catch (_) {
    // null status
  }

  try {
    isOverriddenRisk = !!params[2];
  } catch (_) {
    // null isOverriddenRisk
  }

  const classes = {
    status: {
      [ENUMS.ANALYSIS.ERROR]: 'is-errored',
      [ENUMS.ANALYSIS.WAITING]: 'is-waiting',
      [ENUMS.ANALYSIS.RUNNING]: 'is-progress',
    },
    risk: {
      [ENUMS.RISK.UNKNOWN]: 'is-default',
      [ENUMS.RISK.NONE]: 'is-success',
      [ENUMS.RISK.LOW]: 'is-info',
      [ENUMS.RISK.MEDIUM]: 'is-warning',
      [ENUMS.RISK.HIGH]: 'is-danger',
      [ENUMS.RISK.CRITICAL]: 'is-critical',
    },
  };

  const icons = {
    status: {
      [ENUMS.ANALYSIS.ERROR]: 'warning',
      [ENUMS.ANALYSIS.WAITING]: 'remove-circle',
      [ENUMS.ANALYSIS.RUNNING]: 'loader',
    },
    risk: {
      [ENUMS.RISK.UNKNOWN]: 'close',
      [ENUMS.RISK.NONE]: 'done',
      [ENUMS.RISK.LOW]: 'warning',
      [ENUMS.RISK.MEDIUM]: 'warning',
      [ENUMS.RISK.HIGH]: 'warning',
      [ENUMS.RISK.CRITICAL]: 'warning',
    },
  };

  const labels = {
    status: {
      [ENUMS.ANALYSIS.ERROR]: 'Errored',
      [ENUMS.ANALYSIS.WAITING]: 'Not started',
      [ENUMS.ANALYSIS.RUNNING]: 'Scanning',
    },
    risk: {
      [ENUMS.RISK.UNKNOWN]: 'Untested',
      [ENUMS.RISK.NONE]: 'Passed',
      [ENUMS.RISK.LOW]: 'Low',
      [ENUMS.RISK.MEDIUM]: 'Medium',
      [ENUMS.RISK.HIGH]: 'High',
      [ENUMS.RISK.CRITICAL]: 'Critical',
    },
  };

  if ((status || status == 0) && status !== ENUMS.ANALYSIS.COMPLETED) {
    if (isOverriddenRisk && risk !== null) {
      return {
        cssclass: classes.risk[risk] || classes.status[status] || '',
        icon: icons.status[status] || '',
        label: labels.status[status] || '',
      };
    }
    return {
      cssclass: classes.status[status] || '',
      icon: icons.status[status] || '',
      label: labels.status[status] || '',
    };
  }

  if (risk !== null) {
    return {
      cssclass: classes.risk[risk] || '',
      icon: icons.risk[risk] || '',
      label: labels.risk[risk] || '',
    };
  }

  return {
    cssclass: '',
    icon: '',
    label: '',
  };
}

export default helper(analysisRiskStatus);
