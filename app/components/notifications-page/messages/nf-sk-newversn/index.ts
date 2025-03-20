import Component from '@glimmer/component';
import { type NfSkNewversnContext } from './context';

export interface NotificationsPageMessagesNfSkNewversnComponentArgs {
  Args: {
    context: NfSkNewversnContext;
  };
}

export default class NotificationsPageMessagesNfSkNewversnComponent extends Component<NotificationsPageMessagesNfSkNewversnComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sk-newversn': typeof NotificationsPageMessagesNfSkNewversnComponent;
  }
}
