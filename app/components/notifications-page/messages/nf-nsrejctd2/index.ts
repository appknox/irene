import Component from '@glimmer/component';
import { type NfNsrejctd2Context } from './context';

export interface NotificationsPageMessagesNfNsrejctd2ComponentArgs {
  Args: {
    context: NfNsrejctd2Context;
  };
}

export default class NotificationsPageMessagesNfNsrejctd2Component extends Component<NotificationsPageMessagesNfNsrejctd2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsrejctd2': typeof NotificationsPageMessagesNfNsrejctd2Component;
  }
}
