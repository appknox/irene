import Component from '@glimmer/component';
import { type NfDastcmpltd1Context } from './context';

export interface NotificationsPageMessagesNfDastcmpltd1ComponentArgs {
  Args: {
    context: NfDastcmpltd1Context;
  };
}

export default class NotificationsPageMessagesNfDastcmpltd1Component extends Component<NotificationsPageMessagesNfDastcmpltd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-dastcmpltd1': typeof NotificationsPageMessagesNfDastcmpltd1Component;
  }
}
