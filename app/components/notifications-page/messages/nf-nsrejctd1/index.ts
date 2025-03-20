import Component from '@glimmer/component';
import { type NfNsrejctd1Context } from './context';

export interface NotificationsPageMessagesNfNsrejctd1ComponentArgs {
  Args: {
    context: NfNsrejctd1Context;
  };
}

export default class NotificationsPageMessagesNfNsrejctd1Component extends Component<NotificationsPageMessagesNfNsrejctd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-nsrejctd1': typeof NotificationsPageMessagesNfNsrejctd1Component;
  }
}
