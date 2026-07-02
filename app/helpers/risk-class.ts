import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export type RiskLabelClass =
  | 'is-progress'
  | 'is-success'
  | 'is-info'
  | 'is-warning'
  | 'is-danger'
  | 'is-critical';

export function riskClass(params: [number | null]): RiskLabelClass | undefined {
  switch (params[0]) {
    case ENUMS.RISK.UNKNOWN:
      return 'is-progress';

    case ENUMS.RISK.NONE:
      return 'is-success';

    case ENUMS.RISK.LOW:
      return 'is-info';

    case ENUMS.RISK.MEDIUM:
      return 'is-warning';

    case ENUMS.RISK.HIGH:
      return 'is-danger';

    case ENUMS.RISK.CRITICAL:
      return 'is-critical';
  }
}

const RiskClassHelper = helper(riskClass);

export default RiskClassHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'risk-class': typeof RiskClassHelper;
  }
}
