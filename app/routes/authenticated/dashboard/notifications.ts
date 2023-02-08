import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AkNotificationsService from 'irene/services/ak-notifications';

interface QueryParams {
  notification_limit: number;
  notification_offset: number;
}

export default class AuthenticatedDashboardNotificationsRoute extends Route {
  @service declare akNotifications: AkNotificationsService;

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
    this.akNotifications
      .setNotificationLimitAndOffset(notification_limit, notification_offset)
      .reload();
  }
}
