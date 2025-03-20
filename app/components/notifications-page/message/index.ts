import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import LoggerService from 'irene/services/logger';
import NfInAppNotificationModel from 'irene/models/nf-in-app-notification';
import {
  NotificationMap,
  NotificationMessageKey,
} from 'irene/components/notifications-page/notification_map';
import SkNfInAppNotificationModel from 'irene/models/sk-nf-in-app-notification';

export interface NotificationsPageMessageComponentArgs {
  Args: {
    notification: NfInAppNotificationModel | SkNfInAppNotificationModel;
  };
}

export default class NotificationsPageMessageComponent extends Component<NotificationsPageMessageComponentArgs> {
  @service declare logger: LoggerService;

  get notificationMapObject() {
    const nmo = NotificationMap[this.notificationCode];

    if (nmo) {
      return nmo;
    }

    return NotificationMap['ERROR'];
  }

  get uniqueID() {
    return guidFor(this);
  }

  get notification() {
    return this.args.notification;
  }

  get notificationCode(): NotificationMessageKey {
    return this.notification?.messageCode;
  }

  get componentName() {
    return this.notificationMapObject.component;
  }

  get notificationContext() {
    const contextClass = this.notificationMapObject.context;

    if (!contextClass) {
      this.logger.error(`class not defined for ${this.componentName}`);

      return;
    }

    return new contextClass(this.notification.context);
  }

  @action
  changeRead() {
    this.notification.hasRead = !this.notification.hasRead;
    this.notification.save();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Message': typeof NotificationsPageMessageComponent;
  }
}
