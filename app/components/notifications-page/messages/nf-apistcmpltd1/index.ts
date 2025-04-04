import Component from '@glimmer/component';
import { type NfApistcmpltd1Context } from './context';

export interface NotificationsPageMessagesNfApistcmpltd1ComponentArgs {
  Args: {
    context: NfApistcmpltd1Context;
  };
}

export default class NotificationsPageMessagesNfApistcmpltd1Component extends Component<NotificationsPageMessagesNfApistcmpltd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-apistcmpltd1': typeof NotificationsPageMessagesNfApistcmpltd1Component;
  }
}
