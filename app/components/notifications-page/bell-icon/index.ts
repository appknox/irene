import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type AkNotificationsService from 'irene/services/ak-notifications';
import type SkNotificationsService from 'irene/services/sk-notifications';
import type { NotificationServiceMap } from '..';

interface NotificationsPageBellIconSignature {
  Args: {
    product: IreneProductVariants;
  };
}

export default class NotificationsPageBellIconComponent extends Component<NotificationsPageBellIconSignature> {
  @service declare akNotifications: AkNotificationsService;
  @service declare skNotifications: SkNotificationsService;

  @tracked anchorRef: HTMLElement | null = null;

  notificationServiceMap: NotificationServiceMap;

  constructor(
    owner: unknown,
    args: NotificationsPageBellIconSignature['Args']
  ) {
    super(owner, args);

    this.notificationServiceMap = {
      appknox: this.akNotifications,
      storeknox: this.skNotifications,
    };
  }

  get notificationService() {
    return this.notificationServiceMap[this.args.product];
  }

  @action
  onClick(event: Event) {
    if (this.anchorRef) {
      this.closeNotification();

      return;
    }

    this.anchorRef = event.currentTarget as HTMLElement;
    this.fetchNotifications();
  }

  @action
  closeNotification() {
    this.anchorRef = null;
  }

  @action
  fetchNotifications() {
    this.notificationService.fetchUnRead.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::BellIcon': typeof NotificationsPageBellIconComponent;
  }
}
