import Component from '@glimmer/component';
import config from 'irene/config/environment';
import NfInAppNotificationModel from 'irene/models/nf-in-app-notification';
import { ErrorContext } from './context';

interface NotificationsPageMessagesEmptyArgs {
  notification: NfInAppNotificationModel;
  context: ErrorContext;
}

export default class NotificationsPageMessagesEmpty extends Component<NotificationsPageMessagesEmptyArgs> {
  get showMessage() {
    return config.environment !== 'production';
  }

  get messageCode() {
    return this.args.notification.messageCode;
  }
}
