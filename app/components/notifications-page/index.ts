import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';

import type AkNotificationsService from 'irene/services/ak-notifications';
import type SkNotificationsService from 'irene/services/sk-notifications';

export type NotificationServiceMap = {
  appknox: AkNotificationsService;
  storeknox: SkNotificationsService;
};

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface NotificationsPageComponentSignature {
  Args: {
    product: IreneProductVariants;
  };
}

export default class NotificationsPageComponent extends Component<NotificationsPageComponentSignature> {
  @service declare akNotifications: AkNotificationsService;
  @service declare skNotifications: SkNotificationsService;
  @service declare router: RouterService;

  notificationPageRouteMap = {
    appknox: 'authenticated.dashboard.notifications' as const,
    storeknox: 'authenticated.storeknox.notifications' as const,
  };

  notificationServiceMap: NotificationServiceMap;

  constructor(
    owner: unknown,
    args: NotificationsPageComponentSignature['Args']
  ) {
    super(owner, args);

    this.notificationServiceMap = {
      appknox: this.akNotifications,
      storeknox: this.skNotifications,
    };
  }

  get product() {
    return this.args.product;
  }

  get notificationPageRoute() {
    return this.notificationPageRouteMap[this.product];
  }

  get notificationService() {
    return this.notificationServiceMap[this.product];
  }

  get limit() {
    return this.notificationService.notification_limit;
  }

  get offset() {
    return this.notificationService.notification_offset;
  }

  get tableData() {
    return this.notificationService.notifications;
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get totalCount() {
    return this.notificationService.notificationsCount;
  }

  get isLoading() {
    return this.notificationService.fetch.isRunning;
  }

  get isEmpty() {
    return this.notificationService.notificationsCount == 0;
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
