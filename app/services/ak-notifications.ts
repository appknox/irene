import { task } from 'ember-concurrency';

import type NfInAppNotificationModel from 'irene/models/nf-in-app-notification';

import AkNotificationsBaseService, {
  type NFModelArray,
  type NfInAppNotificationArgs,
} from './ak-notifications-base';

export default class AkNotificationsService extends AkNotificationsBaseService<NfInAppNotificationModel> {
  markAllAsRead = task(async () => {
    const adapter = this.store.adapterFor('nf-in-app-notification');
    await adapter.markAllAsRead();

    return this.refresh.perform();
  });

  fetch = task(async () => {
    const args: NfInAppNotificationArgs = {
      limit: this.notification_limit,
      offset: this.notification_offset,
    };

    if (this.showUnReadOnly) {
      args.has_read = false;
    }

    const notifications = (await this.store.query(
      'nf-in-app-notification',
      args
    )) as NFModelArray<NfInAppNotificationModel>;

    this.notifications = notifications;
    this.notificationsCount = notifications.meta.count;
  });

  fetchUnRead = task(async () => {
    const args: NfInAppNotificationArgs = {
      limit: 7,
      offset: 0,
      has_read: false,
    };

    const notifications = (await this.store.query(
      'nf-in-app-notification',
      args
    )) as NFModelArray<NfInAppNotificationModel>;

    this.notifications_drop_down = notifications;
    this.unReadCount = notifications.meta.count;
  });
}
