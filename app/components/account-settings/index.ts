import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';

type AccountSettingsTab = {
  label: string;
  route: string;
  activeRoutes: string;
};

export default class AccountSettingsComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;

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
      // Every user role registers their own device, so the tab is gated on the
      // org's `cyod` status — not on the owner's registration switch,
      // which blocks new enrolments while the device list stays useful.
      this.organization.isCyodEnabled && {
        label: this.intl.t('cyod.settings.tabLabel'),
        route: 'authenticated.dashboard.account-settings.cyod-settings',
        activeRoutes: 'authenticated.dashboard.account-settings.cyod-settings',
      },
      {
        label: this.intl.t('notificationPreferences'),
        route: 'authenticated.dashboard.account-settings.notification-settings',
        activeRoutes:
          'authenticated.dashboard.account-settings.notification-settings',
      },
    ].filter(Boolean) as AccountSettingsTab[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AccountSettings: typeof AccountSettingsComponent;
  }
}
