import Component from '@glimmer/component';
import { type NfSystmFileUploadSuccessContext } from './context';

export interface NotificationsPageMessagesNfSystmFileUploadSuccessComponentArgs {
  Args: {
    context: NfSystmFileUploadSuccessContext;
  };
}

export default class NotificationsPageMessagesNfSystmFileUploadSuccessComponent extends Component<NotificationsPageMessagesNfSystmFileUploadSuccessComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-systm-file-upload-success': typeof NotificationsPageMessagesNfSystmFileUploadSuccessComponent;
  }
}
