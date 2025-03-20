import Controller from '@ember/controller';

export default class AuthenticatedStoreknoxNotifications extends Controller {
  queryParams = [
    {
      notification_limit: { type: 'number' as const },
    },
    {
      notification_offset: { type: 'number' as const },
    },
  ];

  notification_limit = 10;
  notification_offset = 0;
}
