import Component from '@glimmer/component';
import config from 'irene/config/environment';
import NfInAppNotificationModel from 'irene/models/nf-in-app-notification';
import { type ErrorContext } from './context';

interface NotificationsPageMessagesErrorArgs {
  notification: NfInAppNotificationModel;
  context: ErrorContext;
}

export default class NotificationsPageMessagesErrorComponent extends Component<NotificationsPageMessagesErrorArgs> {
  get showMessage() {
    return config.environment !== 'production';
  }

  get messageCode() {
    return this.args.notification.messageCode;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/error': typeof NotificationsPageMessagesErrorComponent;
  }
}
