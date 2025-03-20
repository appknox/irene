import Component from '@glimmer/component';
import { type NfStrUrlUpldfailpay2Context } from './context';

export interface NotificationsPageMessagesNfStrUrlUpldfailpay2ComponentArgs {
  Args: {
    context: NfStrUrlUpldfailpay2Context;
  };
}

export default class NotificationsPageMessagesNfStrUrlUpldfailpay2Component extends Component<NotificationsPageMessagesNfStrUrlUpldfailpay2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-upldfailpay2': typeof NotificationsPageMessagesNfStrUrlUpldfailpay2Component;
  }
}
