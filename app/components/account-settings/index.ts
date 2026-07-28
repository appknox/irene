import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';

export default class AccountSettingsComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;

  // CYOD Settings sits between Developer Settings and Notification Preferences,
  // per the reviewed design — the Mercer setup steps send the user to Developer
  // Settings for a Personal Token, so the two belong next to each other.
  get tabs() {
    const notificationsIndex = this.baseTabs.findIndex((tab) =>
      tab.route.endsWith('.notification-settings')
    );

    if (notificationsIndex === -1) {
      return [...this.baseTabs, ...this.cyodTabs];
    }

    return [
      ...this.baseTabs.slice(0, notificationsIndex),
      ...this.cyodTabs,
      ...this.baseTabs.slice(notificationsIndex),
    ];
  }

  // Every user role registers their own CYOD device here, so the tab is gated on
  // the org's `cyod` entitlement only — not on the owner's registration switch,
  // which merely blocks new enrolments while the device list stays useful.
  get cyodTabs() {
    if (!this.organization.isCyodEnabled) {
      return [];
    }

    return [
      {
        label: this.intl.t('cyodSettings.tabLabel'),
        route: 'authenticated.dashboard.account-settings.cyod-settings',
        activeRoutes: 'authenticated.dashboard.account-settings.cyod-settings',
      },
    ];
  }

  get baseTabs() {
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
