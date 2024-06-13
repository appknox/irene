import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function metricScope(
  params: Array<string | number | { key: string; value: string | number }>
) {
  let impact = params[0];

  if (typeof impact === 'object') {
    impact = impact.value;
  }

  switch (impact) {
    case ENUMS.SCOPE.UNCHANGED:
      return 'UNCHANGED';

    case ENUMS.SCOPE.CHANGED:
      return 'CHANGED';

    case ENUMS.SCOPE.UNKNOWN:
      return 'UNKNOWN';

    default:
      return impact;
  }
}

export default helper(metricScope);

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'metric-scope': typeof metricScope;
  }
}
