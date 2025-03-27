import { task } from 'ember-concurrency';
import type SkNfInAppNotificationModel from 'irene/models/sk-nf-in-app-notification';

import AkNotificationsBaseService, {
  type NFModelArray,
  type NfInAppNotificationArgs,
} from './ak-notifications-base';

export default class SkNotificationsService extends AkNotificationsBaseService<SkNfInAppNotificationModel> {
  modelName = 'sk-nf-in-app-notification' as const;

  markAllAsRead = task(async () => {
    const adapter = this.store.adapterFor(this.modelName);
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
      this.modelName,
      args
    )) as NFModelArray<SkNfInAppNotificationModel>;

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
      this.modelName,
      args
    )) as NFModelArray<SkNfInAppNotificationModel>;

    this.notifications_drop_down = notifications;
    this.unReadCount = notifications.meta.count;
  });
}
