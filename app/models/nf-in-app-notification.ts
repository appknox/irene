import Model, { attr } from '@ember-data/model';

import {
  NotificationContexts,
  NotificationMessageKey,
} from 'irene/components/notifications-page/notification_map';

export default class NfInAppNotificationModel extends Model {
  @attr('date') declare createdOn: Date;
  @attr('boolean') declare hasRead: boolean;
  @attr('string') declare messageCode: NotificationMessageKey;
  @attr declare context: NotificationContexts[keyof NotificationContexts];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'nf-in-app-notification': NfInAppNotificationModel;
  }
}
