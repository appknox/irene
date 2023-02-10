import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import AkNotificationsService from 'irene/services/ak-notifications';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class NotificationsPageBellIconComponent extends Component {
  @tracked anchorRef?: HTMLElement;
  @tracked showDropDown = false;
  @service declare akNotifications: AkNotificationsService;

  @action
  onClick() {
    this.showDropDown = true;
    this.akNotifications.fetchUnRead.perform();
  }

  @action
  closeNotification() {
    this.showDropDown = false;
  }

  @action registerAnchorRef(element: HTMLElement) {
    this.anchorRef = element;
    this.akNotifications.fetchUnRead.perform();
  }
}
