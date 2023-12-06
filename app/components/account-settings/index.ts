import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';

export default class AccountSettingsComponent extends Component {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  get tabs() {
    return [
      {
        label: this.intl.t('general'),
        route: 'authenticated.settings.general',
        isActive:
          this.router.currentRouteName === 'authenticated.settings.general',
      },
      {
        label: this.intl.t('security'),
        route: 'authenticated.settings.security',
        isActive:
          this.router.currentRouteName === 'authenticated.settings.security',
      },
      {
        label: this.intl.t('developerSettings'),
        route: 'authenticated.settings.developersettings',
        isActive:
          this.router.currentRouteName ===
          'authenticated.settings.developersettings',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AccountSettings: typeof AccountSettingsComponent;
  }
}
