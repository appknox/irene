import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';

import type AkNotificationsService from 'irene/services/ak-notifications';

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class NotificationsPageComponent extends Component {
  @service declare akNotifications: AkNotificationsService;
  @service declare router: RouterService;

  notificationPageRoute = 'authenticated.dashboard.notifications' as const;

  get limit() {
    return this.akNotifications.notification_limit;
  }

  get offset() {
    return this.akNotifications.notification_offset;
  }

  get tableData() {
    return this.akNotifications.notifications;
  }

  get itemPerPageOptions() {
    return [10, 25, 50] as const;
  }

  get totalCount() {
    return this.akNotifications.notificationsCount;
  }

  get isLoading() {
    return this.akNotifications.fetch.isRunning;
  }

  get isEmpty() {
    return this.akNotifications.notificationsCount == 0;
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.router.transitionTo(this.notificationPageRoute, {
      queryParams: { notification_limit: limit, notification_offset: offset },
    });
  }

  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;

    this.router.transitionTo(this.notificationPageRoute, {
      queryParams: { notification_limit: limit, notification_offset: offset },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NotificationsPage: typeof NotificationsPageComponent;
  }
}
