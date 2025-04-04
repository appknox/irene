import Component from '@glimmer/component';
import { type NfStrUrlUploadSuccessContext } from './context';

export interface NotificationsPageMessagesNfStrUrlUploadSuccessComponentArgs {
  Args: {
    context: NfStrUrlUploadSuccessContext;
  };
}

export default class NotificationsPageMessagesNfStrUrlUploadSuccessComponent extends Component<NotificationsPageMessagesNfStrUrlUploadSuccessComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-upload-success': typeof NotificationsPageMessagesNfStrUrlUploadSuccessComponent;
  }
}
