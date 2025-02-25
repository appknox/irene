import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type AkNotificationsService from 'irene/services/ak-notifications';

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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Header': typeof NotificationsPageHeaderComponent;
  }
}
