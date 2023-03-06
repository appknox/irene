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

    if (!amApp?.isActive) {
      return this.intl.t('inactiveCapital');
    }

    if (amApp.isActive) {
      return this.intl.t('activeCapital');
    }

    return this.intl.t('inactiveCapital');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'am-monitoring-text': typeof AmStatusText;
  }
}
