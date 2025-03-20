import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, type TaskForAsyncTaskFunction } from 'ember-concurrency';
import type Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { type DS } from 'ember-data';

type NfInAppNotificationTask = TaskForAsyncTaskFunction<
  unknown,
  () => Promise<void>
>;

type NFModelDataArray<T> = DS.AdapterPopulatedRecordArray<T>;

export type NFModelArray<T> = DS.AdapterPopulatedRecordArray<T> & {
  meta: { count: number };
};

export interface NfInAppNotificationArgs {
  has_read?: boolean;
  limit?: number;
  offset?: number;
}

interface websocketData {
  unReadCount: number;
}

export default abstract class AkNotificationsBaseService<T> extends Service {
  @service declare store: Store;

  @tracked showUnReadOnly = false;
  @tracked notificationsCount = 0;
  @tracked unReadCount = 0;
  @tracked notification_limit = 10;
  @tracked notification_offset = 0;

  @tracked notifications?: NFModelDataArray<T>;
  @tracked notifications_drop_down?: NFModelDataArray<T>;

  declare abstract fetchUnRead: NfInAppNotificationTask;
  declare abstract fetch: NfInAppNotificationTask;
  declare abstract markAllAsRead: NfInAppNotificationTask;

  get hasUnReadNotifications() {
    return this.unReadCount > 0;
  }

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

  refresh = task(async () => {
    await this.fetchUnRead.perform();
    await this.fetch.perform();
  });
}
