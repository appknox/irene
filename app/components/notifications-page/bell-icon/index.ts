import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type AkNotificationsService from 'irene/services/ak-notifications';

export default class NotificationsPageBellIconComponent extends Component {
  @tracked anchorRef: HTMLElement | null = null;
  @service declare akNotifications: AkNotificationsService;

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
    this.akNotifications.fetchUnRead.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::BellIcon': typeof NotificationsPageBellIconComponent;
  }
}
