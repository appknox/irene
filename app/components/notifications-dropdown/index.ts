import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type { Modifier } from '@popperjs/core';
import type AkNotificationsService from 'irene/services/ak-notifications';
import type SkNotificationsService from 'irene/services/sk-notifications';
import type { NotificationServiceMap } from 'irene/components/notifications-page';

interface NotificationsDropdownComponentSignature {
  Args: {
    product: IreneProductVariants;
    anchorRef: HTMLElement | null;
    onClose: () => void;
  };
}

export default class NotificationsDropdownComponent extends Component<NotificationsDropdownComponentSignature> {
  @service declare akNotifications: AkNotificationsService;
  @service declare skNotifications: SkNotificationsService;

  notificationServiceMap: NotificationServiceMap;

  constructor(
    owner: unknown,
    args: NotificationsDropdownComponentSignature['Args']
  ) {
    super(owner, args);

    this.notificationServiceMap = {
      appknox: this.akNotifications,
      storeknox: this.skNotifications,
    };
  }

  get modifiers(): Partial<Modifier<string, object>>[] {
    return [
      {
        name: 'offset',
        options: {
          offset: [50, 0],
        },
      },
    ];
  }

  get notificationService() {
    return this.notificationServiceMap[this.args.product];
  }

  get isLoading() {
    return this.notificationService.fetchUnRead.isRunning;
  }

  get isEmpty() {
    return this.notificationService.unReadCount == 0;
  }

  @action
  closeNotifications() {
    this.args.onClose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NotificationsDropdown: typeof NotificationsDropdownComponent;
  }
}
