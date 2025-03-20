import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type SkNotificationsService from 'irene/services/sk-notifications';

interface QueryParams {
  notification_limit: number;
  notification_offset: number;
}

export default class AuthenticatedStoreknoxNotificationsRoute extends Route {
  @service declare skNotifications: SkNotificationsService;

  queryParams = {
    notification_limit: {
      refreshModel: true,
    },
    notification_offset: {
      refreshModel: true,
    },
  };

  async model(q: QueryParams) {
    const { notification_limit, notification_offset } = q;

    this.skNotifications
      .setNotificationLimitAndOffset(notification_limit, notification_offset)
      .reload();
  }
}
