import Component from '@glimmer/component';
import { type NfUpldfailpay2Context } from './context';

export interface NotificationsPageMessagesNfUpldfailpay2ComponentArgs {
  Args: {
    context: NfUpldfailpay2Context;
  };
}

export default class NotificationsPageMessagesNfUpldfailpay2Component extends Component<NotificationsPageMessagesNfUpldfailpay2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-upldfailpay2': typeof NotificationsPageMessagesNfUpldfailpay2Component;
  }
}
