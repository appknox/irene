import Component from '@glimmer/component';
import { type NfNsreqstd1Context } from './context';

export interface NotificationsPageMessagesNfNsreqstd1ComponentArgs {
  Args: {
    context: NfNsreqstd1Context;
  };
}

export default class NotificationsPageMessagesNfNsreqstd1Component extends Component<NotificationsPageMessagesNfNsreqstd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsreqstd1': typeof NotificationsPageMessagesNfNsreqstd1Component;
  }
}
