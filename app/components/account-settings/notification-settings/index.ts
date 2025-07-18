import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type AjaxService from 'irene/services/ajax';
import type UserModel from 'irene/models/user';

export type AccountSettingsNotificationSettingsToggleKey =
  | 'all_va_completed'
  | 'static_scan_completed'
  | 'dynamic_scan_completed'
  | 'api_scan_completed';

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

export interface AccountSettingsNotificationSettingsSignature {
  Args: {
    user: UserModel;
  };
}

export default class AccountSettingsNotificationSettingsComponent extends Component<AccountSettingsNotificationSettingsSignature> {
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

  constructor(
    owner: unknown,
    args: AccountSettingsNotificationSettingsSignature['Args']
  ) {
    super(owner, args);

    this.fetchUserNotificationPreferences.perform();
  }

  get notificationSettings(): AccountSettingsNotificationSettings[] {
    const disableIndividualScanLevelNotification =
      this.userNotificationPreferences.all_va_completed;

    return [
      {
        id: 'all_va_completed' as const,
        title: 'VA Notification',
        description:
          'Send a notification only when the complete VA is done for the uploaded file (SAST, DAST & API Scan)',
        enabled: this.userNotificationPreferences.all_va_completed,
        disable_toggling: false,
      },
      {
        id: 'static_scan_completed' as const,
        title: 'SAST is completed',
        description: 'Send a notification only when SAST is done.',
        enabled: this.userNotificationPreferences.static_scan_completed,
        disable_toggling: disableIndividualScanLevelNotification,
      },
      {
        id: 'dynamic_scan_completed' as const,
        title: 'DAST is completed',
        description: 'Send a notification only when DAST is done.',
        enabled: this.userNotificationPreferences.dynamic_scan_completed,
        disable_toggling: disableIndividualScanLevelNotification,
      },
      {
        id: 'api_scan_completed' as const,
        title: 'API is completed',
        description: 'Send a notification only when API is done.',
        enabled: this.userNotificationPreferences.api_scan_completed,
        disable_toggling: disableIndividualScanLevelNotification,
      },
    ];
  }

  get vaNotificationGroupSettings() {
    return this.notificationSettings.slice(0, 1);
  }

  get individualScanLevelNotification() {
    return this.notificationSettings.slice(1);
  }

  @action
  updateUserNotificationPreferences(
    key: AccountSettingsNotificationSettingsToggleKey,
    value: boolean
  ) {
    const currUserPrefs = this.userNotificationPreferences;
    currUserPrefs[key] = value;
    this.userNotificationPreferences = currUserPrefs;
  }

  fetchUserNotificationPreferences = task(async () => {
    try {
      const notificationPreferences =
        await this.ajax.request<AccountSettingsUserNotificationPreference>(
          String(ENV.endpoints['userVaNotificationPref']),
          { namespace: ENV.namespace_v2 }
        );

      this.userNotificationPreferences = notificationPreferences;
    } catch (error) {
      this.notify.error(this.intl.t('pleaseTryAgain'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::NotificationSettings': typeof AccountSettingsNotificationSettingsComponent;
  }
}
