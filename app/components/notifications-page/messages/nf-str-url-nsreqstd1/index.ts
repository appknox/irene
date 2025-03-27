import Component from '@glimmer/component';
import { type NfStrUrlNsreqstd1Context } from './context';

export interface NotificationsPageMessagesNfStrUrlNsreqstd1ComponentArgs {
  Args: {
    context: NfStrUrlNsreqstd1Context;
  };
}

export default class NotificationsPageMessagesNfStrUrlNsreqstd1Component extends Component<NotificationsPageMessagesNfStrUrlNsreqstd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-nsreqstd1': typeof NotificationsPageMessagesNfStrUrlNsreqstd1Component;
  }
}
