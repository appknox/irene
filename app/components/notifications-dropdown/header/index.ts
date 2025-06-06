import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type AkNotificationsService from 'irene/services/ak-notifications';
import type SkNotificationsService from 'irene/services/sk-notifications';
import type { NotificationServiceMap } from 'irene/components/notifications-page';

interface NotificationsDropdownHeaderComponentSignature {
  Args: {
    product: IreneProductVariants;
  };
}

export default class NotificationsDropdownHeaderComponent extends Component<NotificationsDropdownHeaderComponentSignature> {
  @service declare akNotifications: AkNotificationsService;
  @service declare skNotifications: SkNotificationsService;

  notificationServiceMap: NotificationServiceMap;

  constructor(
    owner: unknown,
    args: NotificationsDropdownHeaderComponentSignature['Args']
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

  get unReadCount() {
    return this.notificationService.unReadCount;
  }

  @action
  onShowUnReadOnlyChange() {
    this.notificationService.refresh.perform();
  }

  @action
  markAllAsRead() {
    this.notificationService.markAllAsRead.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsDropdown::Header': typeof NotificationsDropdownHeaderComponent;
  }
}
