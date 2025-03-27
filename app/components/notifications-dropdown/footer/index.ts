import Component from '@glimmer/component';
import { action } from '@ember/object';

interface NotificationsDropdownComponentArgs {
  onViewAllNotificationClick: () => void;
  product: IreneProductVariants;
}

export default class NotificationsDropdownFooterComponent extends Component<NotificationsDropdownComponentArgs> {
  viewAllNotifsRoute = {
    appknox: 'authenticated.dashboard.notifications',
    storeknox: 'authenticated.storeknox.notifications',
  };

  get viewAllNotificationsRoute() {
    return this.viewAllNotifsRoute[this.args.product];
  }

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
