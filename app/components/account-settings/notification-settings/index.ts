import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type AjaxService from 'irene/services/ajax';

export type AccountSettingsNotificationSettingsToggleKey =
  | 'all_va_completed'
  | 'static_scan_completed'
  | 'dynamic_scan_completed'
  | 'api_scan_completed';

export interface AccountSettingsNotificationSettingsGroup {
  id: string;
  title: string;
  tooltipText: string;
  settings: AccountSettingsNotificationSettings[];
}

export interface AccountSettingsNotificationSettings {
  id: AccountSettingsNotificationSettingsToggleKey;
  title: string;
  description: string;
  enabled: boolean;
  disable_toggling?: boolean;
}

export type AccountSettingsUserNotificationPreference = Record<
  AccountSettingsNotificationSettingsToggleKey,
  boolean
>;

export default class AccountSettingsNotificationSettingsComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: AjaxService;
  @service('notifications') declare notify: NotificationService;

  @tracked
  userNotificationPreferences: AccountSettingsUserNotificationPreference = {
    all_va_completed: false,
    static_scan_completed: false,
    dynamic_scan_completed: false,
    api_scan_completed: false,
  };

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchUserNotificationPreferences.perform();
  }

  get isVaNotificationEnabled() {
    return this.userNotificationPreferences.all_va_completed;
  }

  get notificationSettingsGroups(): AccountSettingsNotificationSettingsGroup[] {
    return [
      // VA Notification
      {
        id: 'va_notification',
        title: this.intl.t('accountNotifSettings.vaNotificationTitle'),
        tooltipText: this.intl.t('accountNotifSettings.vaNotificationTooltip'),
        settings: [
          {
            id: 'all_va_completed',
            title: this.intl.t('accountNotifSettings.vaNotificationTitle'),
            description: this.intl.t(
              'accountNotifSettings.vaNotificationDescription'
            ),
            enabled: this.userNotificationPreferences.all_va_completed,
            disable_toggling: false,
          },
        ],
      },

      // Individual Scan Level Notification
      {
        id: 'individual_scan_level_notification',
        title: this.intl.t('accountNotifSettings.individualScanTitle'),
        tooltipText: this.intl.t('accountNotifSettings.individualScanTooltip'),
        settings: [
          {
            id: 'static_scan_completed',
            title: this.intl.t('accountNotifSettings.staticScanTitle'),
            description: this.intl.t(
              'accountNotifSettings.staticScanDescription'
            ),
            enabled: this.userNotificationPreferences.static_scan_completed,
            disable_toggling: this.isVaNotificationEnabled,
          },
          {
            id: 'dynamic_scan_completed',
            title: this.intl.t('accountNotifSettings.dynamicScanTitle'),
            description: this.intl.t(
              'accountNotifSettings.dynamicScanDescription'
            ),
            enabled: this.userNotificationPreferences.dynamic_scan_completed,
            disable_toggling: this.isVaNotificationEnabled,
          },
          {
            id: 'api_scan_completed',
            title: this.intl.t('accountNotifSettings.apiScanTitle'),
            description: this.intl.t('accountNotifSettings.apiScanDescription'),
            enabled: this.userNotificationPreferences.api_scan_completed,
            disable_toggling: this.isVaNotificationEnabled,
          },
        ],
      },
    ];
  }

  @action
  updateUserNotificationPreferences(
    preferences: AccountSettingsUserNotificationPreference
  ) {
    this.userNotificationPreferences = preferences;
  }

  fetchUserNotificationPreferences = task(async () => {
    try {
      const notificationPreferences = await waitForPromise(
        this.ajax.request<AccountSettingsUserNotificationPreference>(
          String(ENV.endpoints['userVaNotificationPref']),
          { namespace: ENV.namespace_v2 }
        )
      );

      this.userNotificationPreferences = notificationPreferences;
    } catch (error) {
      this.notify.error(
        this.intl.t('accountNotifSettings.errorFetchingPreferences')
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::NotificationSettings': typeof AccountSettingsNotificationSettingsComponent;
  }
}
