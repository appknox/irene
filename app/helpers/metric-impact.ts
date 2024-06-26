import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function metricImpact(
  params: Array<string | number | { key: string; value: string | number }>
) {
  let impact = params[0];

  if (typeof impact === 'object') {
    impact = impact.value;
  }

  switch (impact) {
    case ENUMS.IMPACTS.NONE:
      return 'NONE';
    case ENUMS.IMPACTS.LOW:
      return 'LOW';
    case ENUMS.IMPACTS.HIGH:
      return 'HIGH';
    case ENUMS.IMPACTS.UNKNOWN:
      return 'UNKNOWN';

    default:
      return impact;
  }
}

export default helper(metricImpact);

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'metric-impact': typeof metricImpact;
  }
}
