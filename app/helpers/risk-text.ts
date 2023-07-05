import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

type Risk = { value: number };

export function riskText(params: [Risk | string | number]) {
  let risk = params[0];

  if (typeof risk === 'object') {
    risk = risk.value;
  }

  risk = parseInt(String(risk));

  switch (risk) {
    case ENUMS.RISK.UNKNOWN:
      return 'untested';
    case ENUMS.RISK.NONE:
      return 'passed';
    case ENUMS.RISK.LOW:
      return 'low';
    case ENUMS.RISK.MEDIUM:
      return 'medium';
    case ENUMS.RISK.HIGH:
      return 'high';
    case ENUMS.RISK.CRITICAL:
      return 'critical';
  }
}

export default helper(riskText);

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'risk-text': typeof riskText;
  }
}
