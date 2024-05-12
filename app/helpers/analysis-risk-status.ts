import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

// Risk classes types
type RiskClassStatusValues = 'is-errored' | 'is-waiting' | 'is-progress';

type RiskClassRiskValues =
  | 'is-default'
  | 'is-success'
  | 'is-info'
  | 'is-warning'
  | 'is-danger'
  | 'is-critical';

type RiskClassRecord = {
  status: Record<number, RiskClassStatusValues>;
  risk: Record<number, RiskClassRiskValues>;
};

// Risk icon types
type RiskIconStatusValues =
  | 'fa-warning'
  | 'fa-minus-circle'
  | 'fa-spinner fa-spin';

type RiskIconRiskValues = 'fa-close' | 'fa-check' | 'fa-warning';

type RiskIconRecord = {
  status: Record<number, RiskIconStatusValues>;
  risk: Record<number, RiskIconRiskValues>;
};

// Risk label types
type RiskLabelStatusValues = 'Errored' | 'Not started' | 'Scanning';

type RiskLabelRiskValues =
  | 'Untested'
  | 'Passed'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical';

type RiskLabelRecord = {
  status: Record<number, RiskLabelStatusValues>;
  risk: Record<number, RiskLabelRiskValues>;
};

export interface AnalysisRiskStatus {
  cssclass: RiskClassStatusValues | RiskClassRiskValues | '';
  icon: RiskIconStatusValues | RiskIconRiskValues | '';
  label: RiskLabelStatusValues | RiskLabelRiskValues | '';
}

export function analysisRiskStatus(
  params: [number, number, boolean]
): AnalysisRiskStatus {
  let risk: number | null = null;
  let status: number | null = null;
  let isOverriddenRisk = false;

  try {
    risk = parseInt(String(params[0]));
  } catch (_) {
    // null risk
  }

  try {
    status = parseInt(String(params[1]));
  } catch (_) {
    // null status
  }

  try {
    isOverriddenRisk = !!params[2];
  } catch (_) {
    // null isOverriddenRisk
  }

  const classes: RiskClassRecord = {
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

  const icons: RiskIconRecord = {
    status: {
      [ENUMS.ANALYSIS.ERROR]: 'fa-warning',
      [ENUMS.ANALYSIS.WAITING]: 'fa-minus-circle',
      [ENUMS.ANALYSIS.RUNNING]: 'fa-spinner fa-spin',
    },
    risk: {
      [ENUMS.RISK.UNKNOWN]: 'fa-close',
      [ENUMS.RISK.NONE]: 'fa-check',
      [ENUMS.RISK.LOW]: 'fa-warning',
      [ENUMS.RISK.MEDIUM]: 'fa-warning',
      [ENUMS.RISK.HIGH]: 'fa-warning',
      [ENUMS.RISK.CRITICAL]: 'fa-warning',
    },
  };

  const labels: RiskLabelRecord = {
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'analysis-risk-status': typeof analysisRiskStatus;
  }
}
