import Component from '@glimmer/component';
import { type NfStrUrlVldtnErrContext } from './context';

export interface NotificationsPageMessagesNfStrUrlVldtnErrComponentArgs {
  Args: {
    context: NfStrUrlVldtnErrContext;
  };
}

export default class NotificationsPageMessagesNfStrUrlVldtnErrComponent extends Component<NotificationsPageMessagesNfStrUrlVldtnErrComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-vldtn-err': typeof NotificationsPageMessagesNfStrUrlVldtnErrComponent;
  }
}
