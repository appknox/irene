import { helper } from '@ember/component/helper';
import { AkChipColor } from 'irene/components/ak-chip';
import AmAppModel from 'irene/models/am-app';

type Positional = [AmAppModel];

export function amMonitoringCondition(params: Positional): AkChipColor {
  const [amApp] = params;

  if (!amApp?.isActive) {
    return 'error';
  }

  if (amApp.isActive) {
    return 'success';
  }

  return 'error';
}

export default helper(amMonitoringCondition);

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'am-monitoring-condition': typeof amMonitoringCondition;
  }
}
