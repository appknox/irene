import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class AccountSettingsComponent extends Component {
  @service declare intl: IntlService;

  get tabs() {
    return [
      {
        label: this.intl.t('general'),
        route: 'authenticated.dashboard.account-settings.general',
        activeRoutes: 'authenticated.dashboard.account-settings.general',
      },
      {
        label: this.intl.t('security'),
        route: 'authenticated.dashboard.account-settings.security',
        activeRoutes: 'authenticated.dashboard.account-settings.security',
      },
      {
        label: this.intl.t('developerSettings'),
        route: 'authenticated.dashboard.account-settings.developersettings',
        activeRoutes:
          'authenticated.dashboard.account-settings.developersettings',
      },
      {
        label: this.intl.t('notificationPreferences'),
        route: 'authenticated.dashboard.account-settings.notification-settings',
        activeRoutes:
          'authenticated.dashboard.account-settings.notification-settings',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AccountSettings: typeof AccountSettingsComponent;
  }
}
