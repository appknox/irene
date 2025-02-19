import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { Modifier } from '@popperjs/core';

import type AkNotificationsService from 'irene/services/ak-notifications';

interface NotificationsDropdownComponentSignature {
  Args: {
    anchorRef: HTMLElement | null;
    onClose: () => void;
  };
}

export default class NotificationsDropdownComponent extends Component<NotificationsDropdownComponentSignature> {
  @service declare akNotifications: AkNotificationsService;

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

  get isLoading() {
    return this.akNotifications.fetchUnRead.isRunning;
  }

  get isEmpty() {
    return this.akNotifications.unReadCount == 0;
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
