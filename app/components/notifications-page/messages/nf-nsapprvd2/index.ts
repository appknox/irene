import Component from '@glimmer/component';
import { type NfNsapprvd2Context } from './context';

export interface NotificationsPageMessagesNfNsapprvd2ComponentArgs {
  Args: {
    context: NfNsapprvd2Context;
  };
}

export default class NotificationsPageMessagesNfNsapprvd2Component extends Component<NotificationsPageMessagesNfNsapprvd2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsapprvd2': typeof NotificationsPageMessagesNfNsapprvd2Component;
  }
}
