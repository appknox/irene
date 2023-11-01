import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { Modifier } from '@popperjs/core';
import AkNotificationsService from 'irene/services/ak-notifications';

interface NotificationsDropdownComponentArgs {
  Args: { anchorRef: HTMLElement | null; onClose?: () => void };
}

export default class NotificationsDropdownComponent extends Component<NotificationsDropdownComponentArgs> {
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

  @action closeNotifications() {
    if (this.args.onClose) {
      this.args.onClose();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NotificationsDropdown: typeof NotificationsDropdownComponent;
  }
}
