import Component from '@glimmer/component';
import { type NfNsreqstd2Context } from './context';

export interface NotificationsPageMessagesNfNsreqstd2ComponentArgs {
  Args: {
    context: NfNsreqstd2Context;
  };
}

export default class NotificationsPageMessagesNfNsreqstd2Component extends Component<NotificationsPageMessagesNfNsreqstd2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsreqstd2': typeof NotificationsPageMessagesNfNsreqstd2Component;
  }
}
