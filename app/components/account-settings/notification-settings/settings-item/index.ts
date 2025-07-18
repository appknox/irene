import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type AjaxService from 'irene/services/ajax';

import type {
  AccountSettingsNotificationSettings,
  AccountSettingsNotificationSettingsToggleKey,
} from 'irene/components/account-settings/notification-settings';

export interface AccountSettingsNotificationSettingsItemSignature {
  Args: {
    item: AccountSettingsNotificationSettings;
    updateUserNotifPref: (
      key: AccountSettingsNotificationSettingsToggleKey,
      value: boolean
    ) => void;
  };
}

export default class AccountSettingsNotificationSettingsItemComponent extends Component<AccountSettingsNotificationSettingsItemSignature> {
  @service declare ajax: AjaxService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get isDisabled() {
    return (
      this.args.item.disable_toggling ||
      this.toggleNotificationPreference.isRunning
    );
  }

  @action
  toggleSetting(_event: Event, checked?: boolean) {
    this.toggleNotificationPreference.perform(!!checked);
  }

  toggleNotificationPreference = task(async (checked: boolean) => {
    const url = `${ENV.endpoints['userVaNotificationPref']}/update_user_va_notification_pref`;

    try {
      await this.ajax.put(url, {
        data: { [this.args.item.id]: checked },
        namespace: ENV.namespace_v2,
      });

      this.args.updateUserNotifPref(this.args.item.id, checked);
      this.notify.success('Notification preference updated');
    } catch (error) {
      this.args.updateUserNotifPref(this.args.item.id, !checked);

      this.notify.error(
        'Failed to update notification preference. Please try again.'
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::NotificationSettings::SettingsItem': typeof AccountSettingsNotificationSettingsItemComponent;
  }
}
