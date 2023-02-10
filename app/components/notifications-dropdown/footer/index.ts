import Component from '@glimmer/component';
import { action } from '@ember/object';

interface NotificationsDropdownComponentArgs {
  onViewAllNotificationClick(): void;
}

export default class NotificationsDropdownFooterComponent extends Component<NotificationsDropdownComponentArgs> {
  @action onClick() {
    if (this.args.onViewAllNotificationClick) {
      this.args.onViewAllNotificationClick();
    }
  }
}
