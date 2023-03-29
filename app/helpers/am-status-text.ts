import Helper from '@ember/component/helper';
import IntlService from 'ember-intl/services/intl';
import AmAppModel from 'irene/models/am-app';
import { inject as service } from '@ember/service';

type Positional = [AmAppModel | null];

export interface AmStatusTextSignature {
  Args: {
    Positional: Positional;
  };
  Return: string;
}

export default class AmStatusText extends Helper<AmStatusTextSignature> {
  @service declare intl: IntlService;

  compute(params: Positional): string {
    const [amApp] = params;

    const relevantAmAppVersion = amApp?.relevantAmAppVersion;
    const hasComparableVersion = relevantAmAppVersion?.get('comparableVersion');
    const hasLatestFile = relevantAmAppVersion?.get('latestFile')?.get('id');

    // For scanned state
    if (hasComparableVersion && hasLatestFile) {
      return this.intl.t('scanned');
    }

    // For not-scanned state
    if (hasComparableVersion && !hasLatestFile) {
      return this.intl.t('notScanned');
    }

    if (amApp?.isPending) {
      return this.intl.t('pending');
    }

    if (amApp?.isNotFound) {
      return this.intl.t('notFound');
    }

    return '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'am-status-text': typeof AmStatusText;
  }
}
