import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import AkNotificationsService from 'irene/services/ak-notifications';
import { action } from '@ember/object';

export default class NotificationsPageHeaderComponent extends Component {
  @service declare akNotifications: AkNotificationsService;

  get unReadCount() {
    return this.akNotifications.unReadCount;
  }

  @action
  onShowUnReadOnlyChange() {
    this.akNotifications.refresh.perform();
  }

  @action
  markAllAsRead() {
    this.akNotifications.markAllAsRead.perform();
  }
}
