import Component from '@glimmer/component';
import { type NfNsautoapprvd2Context } from './context';

export interface NotificationsPageMessagesNfNsautoapprvd2ComponentArgs {
  Args: {
    context: NfNsautoapprvd2Context;
  };
}

export default class NotificationsPageMessagesNfNsautoapprvd2Component extends Component<NotificationsPageMessagesNfNsautoapprvd2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsautoapprvd2': typeof NotificationsPageMessagesNfNsautoapprvd2Component;
  }
}
