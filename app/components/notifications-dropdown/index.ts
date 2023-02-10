import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import AkNotificationsService from 'irene/services/ak-notifications';

interface NotificationsDropdownComponentArgs {
  anchorRef: HTMLElement;
  show: boolean;
  onClose?: () => void;
}

export default class NotificationsDropdownComponent extends Component<NotificationsDropdownComponentArgs> {
  @service declare akNotifications: AkNotificationsService;
  get isLoading() {
    return this.akNotifications.fetchUnRead.isRunning;
  }

  get isEmpty() {
    return this.akNotifications.unReadCount == 0;
  }

  @action handleBackdropClick() {
    if (this.args.onClose) {
      this.args.onClose();
    }
  }
}
