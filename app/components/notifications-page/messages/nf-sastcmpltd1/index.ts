import Component from '@glimmer/component';
import { type NfSastcmpltd1Context } from './context';

export interface NotificationsPageMessagesNfSastcmpltd1ComponentArgs {
  Args: {
    context: NfSastcmpltd1Context;
  };
}

export default class NotificationsPageMessagesNfSastcmpltd1Component extends Component<NotificationsPageMessagesNfSastcmpltd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sastcmpltd1': typeof NotificationsPageMessagesNfSastcmpltd1Component;
  }
}
