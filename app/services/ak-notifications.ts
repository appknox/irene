import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import NfInAppNotificationModel from 'irene/models/nf-in-app-notification';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import { action } from '@ember/object';

type NFModelArray = DS.AdapterPopulatedRecordArray<NfInAppNotificationModel> & {
  meta: { count: number };
};

interface NfInAppNotificationArgs {
  has_read?: boolean;
  limit?: number;
  offset?: number;
}

interface websocketData {
  unReadCount: number;
}

export default class AkNotificationsService extends Service {
  @service declare store: Store;
  @tracked showUnReadOnly = false;
  @tracked
  notifications?: DS.AdapterPopulatedRecordArray<NfInAppNotificationModel>;
  @tracked notificationsCount = 0;
  @tracked unReadCount = 0;
  @tracked notification_limit = 10;
  @tracked notification_offset = 0;

  get hasUnReadNotifications() {
    return this.unReadCount > 0;
  }

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
    )) as NFModelArray;

    this.notifications = await notifications;
    this.notificationsCount = notifications.meta.count;
  });

  fetchUnreadCount = task(async () => {
    const unReadNotifications: NFModelArray = (await this.store.query(
      'nf-in-app-notification',
      {
        has_read: false,
        limit: 0,
      }
    )) as NFModelArray;
    const unReadCount = unReadNotifications.meta.count;
    this.unReadCount = unReadCount;
  });

  refresh = task(async () => {
    await this.fetchUnreadCount.perform();
    await this.fetch.perform();
  });

  @action
  realtimeUpdate(data: websocketData) {
    this.unReadCount = data.unReadCount;
  }

  @action
  setNotificationLimitAndOffset(limit = 10, offset = 0) {
    this.notification_limit = limit;
    this.notification_offset = offset;
    return this;
  }

  @action
  reload() {
    return this.refresh.perform();
  }
}
