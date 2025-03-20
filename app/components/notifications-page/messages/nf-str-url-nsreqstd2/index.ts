import Component from '@glimmer/component';
import { type NfStrUrlNsreqstd2Context } from './context';

export interface NotificationsPageMessagesNfStrUrlNsreqstd2ComponentArgs {
  Args: {
    context: NfStrUrlNsreqstd2Context;
  };
}

export default class NotificationsPageMessagesNfStrUrlNsreqstd2Component extends Component<NotificationsPageMessagesNfStrUrlNsreqstd2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-nsreqstd2': typeof NotificationsPageMessagesNfStrUrlNsreqstd2Component;
  }
}
