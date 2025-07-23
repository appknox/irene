import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type AjaxService from 'irene/services/ajax';

import type {
  AccountSettingsNotificationSettings,
  AccountSettingsUserNotificationPreference,
} from 'irene/components/account-settings/notification-settings';

export interface AccountSettingsNotificationSettingsItemSignature {
  Element: HTMLElement;
  Args: {
    item: AccountSettingsNotificationSettings;
    loadingUserNotificationPreferences: boolean;
    userNotificationPreferences: AccountSettingsUserNotificationPreference;
    updateUserNotifPref: (
      userNotificationPreferences: AccountSettingsUserNotificationPreference
    ) => void;
  };
}

export default class AccountSettingsNotificationSettingsItemComponent extends Component<AccountSettingsNotificationSettingsItemSignature> {
  @service declare ajax: AjaxService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get isLoadingPreference() {
    return (
      this.toggleNotificationPreference.isRunning ||
      this.args.loadingUserNotificationPreferences
    );
  }

  get isDisabled() {
    return this.args.item.disable_toggling || this.isLoadingPreference;
  }

  get prefUpdateSuccessMessage() {
    return this.intl.t('accountNotifSettings.notificationPreferenceUpdated');
  }

  get prefUpdateFailedMessage() {
    return this.intl.t(
      'accountNotifSettings.notificationPreferenceUpdateFailed'
    );
  }

  @action
  toggleSetting(_event: Event, checked?: boolean) {
    this.toggleNotificationPreference.perform(!!checked);
  }

  toggleNotificationPreference = task(async (checked: boolean) => {
    try {
      const url = `${ENV.endpoints['userVaNotificationPref']}/update_user_va_notification_pref`;

      const response = (await this.ajax.put(url, {
        data: { [this.args.item.id]: checked },
        namespace: ENV.namespace_v2,
      })) as AccountSettingsUserNotificationPreference;

      this.args.updateUserNotifPref(response);
      this.notify.success(this.prefUpdateSuccessMessage);
    } catch (error) {
      this.args.updateUserNotifPref(this.args.userNotificationPreferences);
      this.notify.error(this.prefUpdateFailedMessage);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::NotificationSettings::SettingsItem': typeof AccountSettingsNotificationSettingsItemComponent;
  }
}
