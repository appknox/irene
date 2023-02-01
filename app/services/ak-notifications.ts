import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import NfInAppNotificationModel from 'irene/models/nf-in-app-notification';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

type NFModelArray = DS.AdapterPopulatedRecordArray<NfInAppNotificationModel> & {
  meta: { count: number };
};

interface NfInAppNotificationArgs {
  has_read?: boolean;
}

export default class AkNotificationsService extends Service {
  @service declare store: Store;
  @tracked showUnReadOnly = false;
  @tracked
  notifications?: DS.AdapterPopulatedRecordArray<NfInAppNotificationModel>;

  @tracked unReadCount = 0;

  markAllAsRead = task(async () => {
    const adapter = this.store.adapterFor('nf-in-app-notification');
    await adapter.markAllAsRead();
    return this.refresh.perform();
  });

  fetch = task(async () => {
    const args: NfInAppNotificationArgs = {};
    if (this.showUnReadOnly) {
      args.has_read = false;
    }
    const notifications = await this.store.query(
      'nf-in-app-notification',
      args
    );
    this.notifications = await notifications;
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
}
