import Component from '@glimmer/component';
import { type NfAmNewversnContext } from './context';

export interface NotificationsPageMessagesNfAmNewversnComponentArgs {
  Args: {
    context: NfAmNewversnContext;
  };
}

export default class NotificationsPageMessagesNfAmNewversnComponent extends Component<NotificationsPageMessagesNfAmNewversnComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-am-newversn': typeof NotificationsPageMessagesNfAmNewversnComponent;
  }
}
