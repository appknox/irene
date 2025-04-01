import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';

export default class AiReportingTurnOnSettingsComponent extends Component {
  @service declare me: MeService;
  @service declare intl: IntlService;

  get features() {
    return [
      this.intl.t('reportModule.feature.1', {
        htmlSafe: true,
      }),
      this.intl.t('reportModule.feature.2', {
        htmlSafe: true,
      }),
      this.intl.t('reportModule.feature.3', {
        htmlSafe: true,
      }),
      this.intl.t('reportModule.feature.4', {
        htmlSafe: true,
      }),
    ];
  }

  get headerText() {
    if (this.me.org?.is_owner) {
      return this.intl.t('reportModule.turnOnSettingsHeaderOwner');
    }
    return this.intl.t('reportModule.turnOnSettingsHeaderUser');
  }

  get bodyText() {
    if (this.me.org?.is_owner) {
      return this.intl.t('reportModule.turnOnSettingsBodyOwner', {
        htmlSafe: true,
      });
    }
    return this.intl.t('reportModule.turnOnSettingsBodyUser', {
      htmlSafe: true,
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::TurnOnSettings': typeof AiReportingTurnOnSettingsComponent;
  }
}
