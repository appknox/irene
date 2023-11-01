import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import AkNotificationsService from 'irene/services/ak-notifications';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
