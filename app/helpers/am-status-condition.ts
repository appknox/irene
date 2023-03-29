import { helper } from '@ember/component/helper';
import { AkChipColor } from 'irene/components/ak-chip';
import AmAppModel from 'irene/models/am-app';

type Positional = [AmAppModel | null];

export function amStatusCondition(params: Positional): AkChipColor {
  const [amApp] = params;

  const relevantAmAppVersion = amApp?.relevantAmAppVersion;
  const hasComparableVersion = relevantAmAppVersion?.get('comparableVersion');
  const hasLatestFile = relevantAmAppVersion?.get('latestFile')?.get('id');

  // For scanned state
  if (hasComparableVersion && hasLatestFile) {
    return 'success';
  }

  // For not-scanned state
  if (hasComparableVersion && !hasLatestFile) {
    return 'error';
  }

  if (amApp?.isPending) {
    return 'warn';
  }

  if (amApp?.isNotFound) {
    return 'error';
  }

  return 'default';
}

export default helper(amStatusCondition);

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'am-status-condition': typeof amStatusCondition;
  }
}
