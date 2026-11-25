import { task } from 'ember-concurrency';

import type NfInAppNotificationModel from 'irene/models/nf-in-app-notification';
import type { NotificationMessageKey } from 'irene/components/notifications-page/notification_map';

import AkNotificationsBaseService, {
  type NFModelArray,
  type NfInAppNotificationArgs,
} from './ak-notifications-base';

// The backend still sends these, but their target pages no longer exist.
// Remove once the backend stops returning them in the VAPT feed.
const HIDDEN_MESSAGE_CODES: Set<NotificationMessageKey> = new Set([
  'NF_AM_NEWVERSN',
]);

const withoutHiddenMessageCodes = (
  notifications: NFModelArray<NfInAppNotificationModel>
) => notifications.filter((n) => !HIDDEN_MESSAGE_CODES.has(n.messageCode));

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

    this.notifications = withoutHiddenMessageCodes(notifications);
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

    this.notifications_drop_down = withoutHiddenMessageCodes(notifications);
    this.unReadCount = notifications.meta.count;
  });
}
