import Component from '@glimmer/component';
import { action } from '@ember/object';

interface NotificationsDropdownComponentArgs {
  onViewAllNotificationClick: () => void;
}

export default class NotificationsDropdownFooterComponent extends Component<NotificationsDropdownComponentArgs> {
  @action
  onClick() {
    this.args.onViewAllNotificationClick();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsDropdown::Footer': typeof NotificationsDropdownFooterComponent;
  }
}
